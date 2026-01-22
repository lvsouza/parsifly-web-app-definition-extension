import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';

import { NewFolder, NewStructure, NewStructureAttribute } from '../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { loadStructureAttributes } from './attributes';


const loadStructures = async (extensionContext: TExtensionContext, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('structure')
    .select(['id', 'name', 'type', 'description'])
    .where(builder => builder.or([
      builder('parentFolderId', '=', parentId),
      builder('parentProjectId', '=', parentId),
    ]))
    .unionAll(
      databaseHelper
        .selectFrom('folder')
        .select(['id', 'name', 'type', 'description'])
        .where('of', '=', 'structure')
        .where(builder => builder.or([
          builder('parentFolderId', '=', parentId),
          builder('parentProjectId', '=', parentId),
        ]))
    )
    .orderBy('type', 'asc')
    .orderBy('name', 'asc')
    .execute();

  return items.map(item => {
    if (item.type === 'folder') {
      let totalItems = 0;

      return new ListViewItem({
        key: item.id,
        initialValue: {
          children: true,
          label: item.name,
          icon: { type: 'structure-folder' },
          onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
          onItemDoubleClick: (context) => context.set('opened', !context.currentValue.opened),
          getContextMenuItems: async (context) => {
            return [
              new Action({
                key: `new-structure:${item.id}`,
                initialValue: {
                  label: 'New structure',
                  icon: { type: 'structure-add' },
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
                      await databaseHelper.insertInto('structure').values(newItem).execute();
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
                  icon: { type: 'folder-add' },
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
                      await databaseHelper.insertInto('folder').values(newItem).execute();
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
                  icon: { type: 'delete' },
                  description: 'This structure is irreversible',
                  action: async () => {
                    await databaseHelper.deleteFrom('folder').where('id', '=', item.id).execute();
                    const selectionId = await extensionContext.selection.get();
                    if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                  },
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadStructures(extensionContext, projectId, item.id);
            context.set('children', items.length > 0);
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
              await databaseHelper
                .updateTable(event.mimeType === 'application/x.parsifly.structure' ? 'structure' : 'folder')
                .set('parentFolderId', item.id)
                .set('parentProjectId', null)
                .where('id', '=', event.key)
                .execute();
            } catch (error) {
              if (DatabaseError.as(error).code === 'P1001') extensionContext.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
              else if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information');
              else throw error;
            }
          },
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const selectionIds = await extensionContext.selection.get();
          context.set('selected', selectionIds.includes(item.id));

          const editionSub = extensionContext.edition.subscribe(key => context.set('editing', key === item.id));
          const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

          const itemsSub = await extensionContext.data.subscribe({
            query: (
              databaseHelper
                .selectFrom('structure')
                .select(['id'])
                .where('parentFolderId', '=', item.id)
                .unionAll(
                  databaseHelper
                    .selectFrom('folder')
                    .select(['id'])
                    .where('of', '=', 'structure')
                    .where('parentFolderId', '=', item.id)
                )
                .compile()
            ),
            listener: async (data) => {
              if (totalItems === data.rows.length) return;
              await context.refetchChildren()
            },
          });
          const detailsSub = await extensionContext.data.subscribe({
            query: (
              databaseHelper
                .selectFrom('folder')
                .select(['id', 'name', 'description'])
                .where('id', '=', item.id)
                .compile()
            ),
            listener: async ({ rows: [itemChanged] }) => {
              context.set('label', itemChanged.name || '');
              context.set('description', itemChanged.description || '');
            },
          });

          return async () => {
            editionSub();
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
        icon: { type: 'structure' },
        onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
        onItemDoubleClick: (context) => context.set('opened', !context.currentValue.opened),
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(extensionContext, projectId, item);
          await context.set('children', items.length > 0);
          totalItems = items.length;
          return items;
        },
        getContextMenuItems: async (context) => {
          return [
            new Action({
              key: `new-structure-attribute:${item.id}`,
              initialValue: {
                label: 'New attribute',
                icon: { type: 'structure-add' },
                description: 'Add to this item a new attribute',
                action: async () => {
                  const name = await extensionContext.quickPick.show<string>({
                    title: 'Attribute name?',
                    placeholder: 'Example: Attribute1',
                    helpText: 'Type the name of the attribute.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewStructureAttribute = {
                    name: name,
                    description: '',
                    id: crypto.randomUUID(),
                    required: false,
                    dataType: 'string',
                    projectOwnerId: projectId,
                    parentStructureId: item.id,
                    parentStructureAttributeId: null,
                  };

                  try {
                    await databaseHelper.insertInto('structureAttribute').values(newItem).execute();
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
                icon: { type: 'delete' },
                description: 'This structure is irreversible',
                action: async () => {
                  await databaseHelper.deleteFrom('structure').where('id', '=', item.id).execute();
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
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        const editionId = await extensionContext.edition.get();
        context.set('selected', selectionIds.includes(item.id));
        context.set('editing', editionId === item.id);

        const editionSub = extensionContext.edition.subscribe(key => context.set('editing', key === item.id));
        const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

        const itemsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('structureAttribute')
              .select(['id'])
              .where(builder => builder.or([
                builder('parentStructureId', '=', item.id),
                builder('parentStructureAttributeId', '=', item.id),
              ]))
              .compile()
          ),
          listener: async (data) => {
            if (totalItems === data.rows.length) return;
            await context.refetchChildren();
          },
        });
        const detailsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('structure')
              .select(['id', 'name', 'description'])
              .where('id', '=', item.id)
              .compile()
          ),
          listener: async ({ rows: [itemChanged] }) => {
            context.set('label', itemChanged.name || '');
            context.set('description', itemChanged.description || '');
          },
        });

        return async () => {
          editionSub();
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
      icon: { type: 'structure-folder' },
      onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
      onItemDoubleClick: (context) => context.set('opened', !context.currentValue.opened),
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
              icon: { type: 'structure-add' },
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
                  await databaseHelper.insertInto('structure').values(newItem).execute();
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
              icon: { type: 'folder-add' },
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
                  await databaseHelper.insertInto('folder').values(newItem).execute();
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
          await databaseHelper
            .updateTable(event.mimeType === 'application/x.parsifly.structure' ? 'structure' : 'folder')
            .set('parentFolderId', null)
            .set('parentProjectId', parentId)
            .where('id', '=', event.key)
            .execute();
        } catch (error) {
          if (DatabaseError.as(error).code === 'P1001') extensionContext.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
          else if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information');
          else throw error;
        }
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await extensionContext.data.subscribe({
        query: (
          databaseHelper
            .selectFrom('structure')
            .select(['id'])
            .where('parentProjectId', '=', projectId)
            .unionAll(
              databaseHelper
                .selectFrom('folder')
                .select(['id'])
                .where('of', '=', 'structure')
                .where('parentProjectId', '=', projectId)
            )
            .compile()
        ),
        listener: async (data) => {
          if (totalItems === data.rows.length) return;
          await context.refetchChildren()
        },
      });

      return async () => {
        await itemsSub();
      };
    },
  });
};
