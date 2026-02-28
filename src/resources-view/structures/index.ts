import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';
import { and, asc, eq, or } from 'drizzle-orm';

import { folder, NewFolder, NewProperty, NewStructure, property, structure, structureProperty } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadStructureProperties } from './properties';


const loadStructures = async (extensionContext: TExtensionContext, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({
      id: structure.id,
      name: structure.name,
      type: structure.type,
      description: structure.description
    })
    .from(structure)
    .where(or(
      eq(structure.parentFolderId, parentId),
      eq(structure.parentProjectId, parentId),
    ))
    .unionAll(
      databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          type: folder.type,
          description: folder.description
        })
        .from(folder)
        .where(and(
          eq(folder.of, 'structure'),
          or(
            eq(folder.parentFolderId, parentId),
            eq(folder.parentProjectId, parentId),
          )
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name));

  return items.map(item => {
    if (item.type === 'folder') {
      let totalItems = 0;

      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: true,
          label: item.name,
          icon: { path: 'structure-folder.svg' },
          onItemToggle: async (context) => {
            const isOpen = !context.currentValue.opened;

            await context.set('opened', isOpen);

            if (isOpen) {
              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), item.id]);
            } else {
              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== item.id));
            }
          },
          onItemDoubleClick: async (context) => {
            const isOpen = !context.currentValue.opened;

            await context.set('opened', isOpen);

            if (isOpen) {
              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), item.id]);
            } else {
              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== item.id));
            }
          },
          getContextMenuItems: async (context) => {
            return [
              new Action({
                key: `new-structure:${item.id}`,
                initialValue: {
                  label: 'New structure',
                  icon: { path: 'structure.svg' },
                  description: 'Add to this folder a new structure',
                  action: async () => {
                    const name = await extensionContext.quickPick.show<string>({
                      title: 'Structure name?',
                      placeholder: 'Example: Structure1',
                      helpText: 'Type the name of the structure.',
                    });
                    if (!name) return;

                    await context.set('opened', true);

                    const newItem: NewStructure = {
                      name: name,
                      description: '',
                      parentProjectId: null,
                      id: crypto.randomUUID(),
                      parentFolderId: item.id,
                      projectOwnerId: projectId,
                    };

                    try {
                      await databaseHelper.insert(structure).values(newItem);
                      await extensionContext.selection.select(newItem.id!);
                    } catch (error) {
                      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                      else throw error;
                    }
                  },
                },
              }),
              new Action({
                key: `new-folder:${item.id}`,
                initialValue: {
                  label: 'New folder',
                  icon: { path: 'structure-folder.svg' },
                  description: 'Add to this folder a new folder',
                  action: async () => {
                    const name = await extensionContext.quickPick.show<string>({
                      title: 'Folder name',
                      placeholder: 'Example: Folder1',
                      helpText: 'Type the name of the folder.',
                    });
                    if (!name) return;

                    await context.set('opened', true);

                    const newItem: NewFolder = {
                      name: name,
                      of: 'structure',
                      description: '',
                      parentProjectId: null,
                      id: crypto.randomUUID(),
                      parentFolderId: item.id,
                      projectOwnerId: projectId,
                    };

                    try {
                      await databaseHelper.insert(folder).values(newItem);
                      await extensionContext.selection.select(newItem.id!);
                    } catch (error) {
                      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                      else throw error;
                    }
                  },
                },
              }),
              new Action({
                key: `delete:${item.id}`,
                initialValue: {
                  label: 'Delete',
                  icon: { path: 'delete.svg' },
                  description: 'This structure is irreversible',
                  action: async () => {
                    await databaseHelper.delete(folder).where(eq(folder.id, item.id));
                    const selectionId = await extensionContext.selection.get();
                    if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                  },
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadStructures(extensionContext, projectId, item.id);
            await context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await extensionContext.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.structure-folder',
          dropAccepts: [
            'application/x.parsifly.structure',
            'application/x.parsifly.structure-folder',
          ],
          onDidDrop: async (_context, event) => {
            if (item.id === event.key) return;

            try {
              const tableToUpdate = event.mimeType === 'application/x.parsifly.structure' ? structure : folder;

              await databaseHelper
                .update(tableToUpdate)
                .set({
                  parentFolderId: item.id,
                  parentProjectId: null
                })
                .where(eq(tableToUpdate.id, event.key));
            } catch (error) {
              if (DatabaseError.as(error).code === 'P1001') extensionContext.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
              else if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information');
              else throw error;
            }
          },
        },
        onDidMount: async (context) => {
          await context.set('label', item.name);
          await context.set('description', item.description || '');

          const selectionIds = await extensionContext.selection.get();
          await context.set('selected', selectionIds.includes(item.id));

          const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
          await context.set('opened', openedIds ? openedIds.includes(item.id) : context.currentValue.opened);

          const selectionSub = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(item.id)));

          const [itemsQuery, itemsMapResult] = mappableQuery(
            databaseHelper
              .select({
                id: structure.id,
              })
              .from(structure)
              .where(eq(structure.parentFolderId, item.id))
              .unionAll(
                databaseHelper
                  .select({
                    id: folder.id,
                  })
                  .from(folder)
                  .where(and(
                    eq(folder.of, 'structure'),
                    eq(folder.parentFolderId, item.id)
                  ))
              )
          );
          const itemsSub = await extensionContext.data.subscribe({
            query: itemsQuery,
            listener: async (data) => {
              const items = itemsMapResult(data);
              if (totalItems === items.length) return;
              await context.refetchChildren()
            },
          });

          const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
            databaseHelper
              .select({
                id: folder.id,
                name: folder.name,
                description: folder.description,
              })
              .from(folder)
              .where(eq(folder.id, item.id))
          );
          const detailsSub = await extensionContext.data.subscribe({
            query: itemDetailQuery,
            listener: async (data) => {
              const [itemChanged] = itemDetailMapResult(data);
              await context.set('label', itemChanged.name || '');
              await context.set('description', itemChanged.description || '');
            },
          });

          return async () => {
            selectionSub();
            await itemsSub();
            await detailsSub();
          };
        },
      })
    }

    let totalItems = 0;
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: true,
        label: item.name,
        icon: { path: 'structure.svg' },
        onItemToggle: async (context) => {
          const isOpen = !context.currentValue.opened;

          await context.set('opened', isOpen);

          if (isOpen) {
            await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), item.id]);
          } else {
            await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== item.id));
          }
        },
        onItemDoubleClick: async (context) => {
          const isOpen = !context.currentValue.opened;

          await context.set('opened', isOpen);

          if (isOpen) {
            await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), item.id]);
          } else {
            await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== item.id));
          }
        },
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureProperties(extensionContext, projectId, item);
          await context.set('children', items.length > 0);
          totalItems = items.length;
          return items;
        },
        getContextMenuItems: async (context) => {
          return [
            new Action({
              key: `new-structure-property:${item.id}`,
              initialValue: {
                label: 'New property',
                icon: { path: 'structure.svg' },
                description: 'Add to this item a new property',
                action: async () => {
                  const name = await extensionContext.quickPick.show<string>({
                    title: 'Property name?',
                    placeholder: 'Example: Property1',
                    helpText: 'Type the name of the property.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewProperty = {
                    name: name,
                    description: '',
                    required: false,
                    dataType: 'string',
                    id: crypto.randomUUID(),
                    projectOwnerId: projectId,
                  };

                  try {
                    const newId = await databaseHelper.transaction(async (trx) => {
                      const [insertedProperty] = await trx.insert(property).values(newItem).returning({ id: property.id });

                      await trx.insert(structureProperty).values({
                        structureId: item.id,
                        propertyId: insertedProperty.id,
                      });

                      return insertedProperty.id
                    });
                    await extensionContext.selection.select(newId);
                  } catch (error) {
                    if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                    else throw error;
                  }
                },
              },
            }),
            new Action({
              key: `delete:${item.id}`,
              initialValue: {
                label: 'Delete',
                icon: { path: 'delete.svg' },
                description: 'This structure is irreversible',
                action: async () => {
                  await databaseHelper.delete(structure).where(eq(structure.id, item.id));
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                },
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.structure',
      },
      onDidMount: async (context) => {
        await context.set('label', item.name);
        await context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        await context.set('selected', selectionIds.includes(item.id));

        const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
        await context.set('opened', openedIds ? openedIds.includes(item.id) : context.currentValue.opened);

        const selectionSub = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(item.id)));

        const [itemsQuery, itemsMapResult] = mappableQuery(
          databaseHelper
            .select({
              id: structureProperty.id,
            })
            .from(structureProperty)
            .innerJoin(property, eq(property.id, structureProperty.propertyId))
            .where(or(
              eq(structureProperty.structureId, item.id),
              eq(property.parentPropertyId, item.id),
            ))
        );
        const itemsSub = await extensionContext.data.subscribe({
          query: itemsQuery,
          listener: async (data) => {
            const items = itemsMapResult(data);
            if (totalItems === items.length) return;
            await context.refetchChildren();
          },
        });

        const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
          databaseHelper
            .select({
              id: structure.id,
              name: structure.name,
              description: structure.description,
            })
            .from(structure)
            .where(eq(structure.id, item.id))
        );
        const detailsSub = await extensionContext.data.subscribe({
          query: itemDetailQuery,
          listener: async (data) => {
            const [itemChanged] = itemDetailMapResult(data);
            await context.set('label', itemChanged.name || '');
            await context.set('description', itemChanged.description || '');
          },
        });

        return async () => {
          selectionSub();
          await itemsSub();
          await detailsSub();
        };
      },
    });
  });
}


export const loadStructuresFolder = (extensionContext: TExtensionContext, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  let totalItems = 0;

  return new ListViewItem({
    key: 'structures-group',
    initialValue: {
      opened: true,
      label: 'Structures',
      children: true,
      disableSelect: true,
      icon: { path: 'structure-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'structures-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'structures-group'));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'structures-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'structures-group'));
        }
      },
      getItems: async (context) => {
        const items = await loadStructures(extensionContext, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `new-structure:${parentId}`,
            initialValue: {
              label: 'New structure',
              icon: { path: 'structure.svg' },
              description: 'Add to this folder a new structure',
              action: async () => {
                const name = await extensionContext.quickPick.show<string>({
                  title: 'Structure name?',
                  placeholder: 'Example: Structure1',
                  helpText: 'Type the name of the structure.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem: NewStructure = {
                  name: name,
                  description: '',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
                };

                try {
                  await databaseHelper.insert(structure).values(newItem);
                  await extensionContext.selection.select(newItem.id!);
                } catch (error) {
                  if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                  else throw error;
                }
              },
            },
          }),
          new Action({
            key: `new-folder:${parentId}`,
            initialValue: {
              label: 'New folder',
              icon: { path: 'structure-folder.svg' },
              description: 'Add to this folder a new folder',
              action: async () => {
                const name = await extensionContext.quickPick.show<string>({
                  title: 'Folder name',
                  placeholder: 'Example: Folder1',
                  helpText: 'Type the name of the folder.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem: NewFolder = {
                  name: name,
                  description: '',
                  of: 'structure',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
                };

                try {
                  await databaseHelper.insert(folder).values(newItem);
                  await extensionContext.selection.select(newItem.id!);
                } catch (error) {
                  if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information');
                  else throw error;
                }
              },
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.structure',
        'application/x.parsifly.structure-folder',
      ],
      onDidDrop: async (_context, event) => {
        try {
          const tableToUpdate = event.mimeType === 'application/x.parsifly.structure' ? structure : folder;
          await databaseHelper
            .update(tableToUpdate)
            .set({
              parentFolderId: null,
              parentProjectId: parentId,
            })
            .where(eq(tableToUpdate.id, event.key));
        } catch (error) {
          if (DatabaseError.as(error).code === 'P1001') extensionContext.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
          else if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information');
          else throw error;
        }
      },
    },
    onDidMount: async (context) => {

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes('structures-group') : context.currentValue.opened);

      const [itemsQuery, itemsMapResult] = mappableQuery(
        databaseHelper
          .select({
            id: structure.id,
          })
          .from(structure)
          .where(eq(structure.parentProjectId, projectId))
          .unionAll(
            databaseHelper
              .select({
                id: folder.id,
              })
              .from(folder)
              .where(and(
                eq(folder.of, 'structure'),
                eq(folder.parentProjectId, projectId)
              ))
          )
      );
      const itemsSub = await extensionContext.data.subscribe({
        query: itemsQuery,
        listener: async (data) => {
          const items = itemsMapResult(data);
          if (totalItems === items.length) return;
          await context.refetchChildren()
        },
      });

      return async () => {
        await itemsSub();
      };
    },
  });
};
