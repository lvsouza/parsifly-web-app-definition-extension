import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';
import { and, asc, eq, or } from 'drizzle-orm';

import { NewFolder, NewEnum, NewEnumProperty, enumTable, folder, enumProperty } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadEnumProperties } from './properties';
import { loadEnumValuesFolder } from './values';


const loadEnums = async (extensionContext: TExtensionContext, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({
      id: enumTable.id,
      name: enumTable.name,
      type: enumTable.type,
      description: enumTable.description,
    })
    .from(enumTable)
    .where(or(
      eq(enumTable.parentFolderId, parentId),
      eq(enumTable.parentProjectId, parentId),
    ))
    .unionAll(
      databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          type: folder.type,
          description: folder.description,
        })
        .from(folder)
        .where(and(
          eq(folder.of, 'enum'),
          or(
            eq(folder.parentFolderId, parentId),
            eq(folder.parentProjectId, parentId),
          )
        ))
    )
    .orderBy(asc(enumTable.type), asc(folder.type), asc(enumTable.name), asc(folder.name));

  return items.map(item => {
    if (item.type === 'folder') {
      let totalItems = 0;

      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: true,
          label: item.name,
          icon: { path: 'enum-folder.svg' },
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
                key: `new-enum:${item.id}`,
                initialValue: {
                  label: 'New enum',
                  icon: { path: 'enum.svg' },
                  description: 'Add to this folder a new enum',
                  action: async () => {
                    const name = await extensionContext.quickPick.show<string>({
                      title: 'Enum name?',
                      placeholder: 'Example: Enum1',
                      helpText: 'Type the name of the enum.',
                    });
                    if (!name) return;

                    await context.set('opened', true);

                    const newItem: NewEnum = {
                      name: name,
                      description: '',
                      parentProjectId: null,
                      id: crypto.randomUUID(),
                      parentFolderId: item.id,
                      projectOwnerId: projectId,
                    };

                    try {
                      await databaseHelper.insert(enumTable).values(newItem);
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
                  icon: { path: 'enum-folder.svg' },
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
                      of: 'enum',
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
                  description: 'This enum is irreversible',
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
            const items = await loadEnums(extensionContext, projectId, item.id);
            await context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await extensionContext.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.enum-folder',
          dropAccepts: [
            'application/x.parsifly.enum',
            'application/x.parsifly.enum-folder',
          ],
          onDidDrop: async (_context, event) => {
            if (item.id === event.key) return;

            try {
              const tableToUpdate = event.mimeType === 'application/x.parsifly.enum' ? enumTable : folder;
              await databaseHelper
                .update(tableToUpdate)
                .set({
                  parentFolderId: item.id,
                  parentProjectId: null,
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
                id: enumTable.id,
              })
              .from(enumTable)
              .where(eq(enumTable.parentFolderId, item.id))
              .unionAll(
                databaseHelper
                  .select({
                    id: folder.id,
                  })
                  .from(folder)
                  .where(and(
                    eq(folder.of, 'enum'),
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
        icon: { path: 'enum.svg' },
        dragProvides: 'application/x.parsifly.enum',
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
        getItems: async () => {
          const enumValuesFolder = loadEnumValuesFolder(extensionContext, projectId, item.id);
          const items = await loadEnumProperties(extensionContext, projectId, item);
          totalItems = items.length;
          return [
            enumValuesFolder,
            ...items,
          ];
        },
        getContextMenuItems: async (context) => {
          return [
            new Action({
              key: `new-enum-property:${item.id}`,
              initialValue: {
                label: 'New property',
                icon: { path: 'enum.svg' },
                description: 'Add to this item a new property',
                action: async () => {
                  const name = await extensionContext.quickPick.show<string>({
                    title: 'Property name?',
                    placeholder: 'Example: Property1',
                    helpText: 'Type the name of the property.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewEnumProperty = {
                    name: name,
                    description: '',
                    id: crypto.randomUUID(),
                    required: false,
                    dataType: 'string',
                    projectOwnerId: projectId,
                    parentEnumId: item.id,
                  };

                  try {
                    await databaseHelper.insert(enumProperty).values(newItem);
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
                description: 'This enum is irreversible',
                action: async () => {
                  await databaseHelper.delete(enumTable).where(eq(enumTable.id, item.id));
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                },
              },
            }),
          ];
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
              id: enumProperty.id,
            })
            .from(enumProperty)
            .where(eq(enumProperty.parentEnumId, item.id))
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
              id: enumTable.id,
              name: enumTable.name,
              description: enumTable.description,
            })
            .from(enumTable)
            .where(eq(enumTable.id, item.id))
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


export const loadEnumsFolder = (extensionContext: TExtensionContext, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  let totalItems = 0;

  return new ListViewItem({
    key: 'enums-group',
    initialValue: {
      opened: true,
      label: 'Enums',
      children: true,
      disableSelect: true,
      icon: { path: 'enum-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'enums-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'enums-group'));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'enums-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'enums-group'));
        }
      },
      getItems: async (context) => {
        const items = await loadEnums(extensionContext, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `new-enum:${parentId}`,
            initialValue: {
              label: 'New enum',
              icon: { path: 'enum.svg' },
              description: 'Add to this folder a new enum',
              action: async () => {
                const name = await extensionContext.quickPick.show<string>({
                  title: 'Enum name?',
                  placeholder: 'Example: Enum1',
                  helpText: 'Type the name of the enum.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem: NewEnum = {
                  name: name,
                  description: '',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
                };

                try {
                  await databaseHelper.insert(enumTable).values(newItem);
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
              icon: { path: 'enum-folder.svg' },
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
                  of: 'enum',
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
        'application/x.parsifly.enum',
        'application/x.parsifly.enum-folder',
      ],
      onDidDrop: async (_context, event) => {
        try {
          const tableToUpdate = event.mimeType === 'application/x.parsifly.enum' ? enumTable : folder;
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
      await context.set('opened', openedIds ? openedIds.includes('enums-group') : context.currentValue.opened);

      const [itemsQuery, itemsMapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumTable.id,
          })
          .from(enumTable)
          .where(eq(enumTable.parentProjectId, projectId))
          .unionAll(
            databaseHelper
              .select({
                id: folder.id,
              })
              .from(folder)
              .where(and(
                eq(folder.of, 'enum'),
                eq(folder.parentProjectId, projectId),
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
