import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { NewFolder, NewAction } from '../../definition/DatabaseTypes';


const loadActions = async (extensionContext: TExtensionContext, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('action')
    .select(['id', 'name', 'type', 'description'])
    .where(builder => builder.or([
      builder('parentFolderId', '=', parentId),
      builder('parentProjectId', '=', parentId),
    ]))
    .unionAll(
      databaseHelper
        .selectFrom('folder')
        .select(['id', 'name', 'type', 'description'])
        .where('of', '=', 'action')
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
          icon: { type: 'action-global-folder' },
          onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
          onItemDoubleClick: (context) => context.set('opened', !context.currentValue.opened),
          getContextMenuItems: async (context) => {
            return [
              new Action({
                key: `new-action:${item.id}`,
                initialValue: {
                  label: 'New action',
                  icon: { type: 'action-global-add' },
                  description: 'Add to this folder a new action',
                  action: async () => {
                    const name = await extensionContext.quickPick.show<string>({
                      title: 'Action name?',
                      placeholder: 'Example: Action1',
                      helpText: 'Type the name of the action.',
                    });
                    if (!name) return;

                    await context.set('opened', true);

                    const newItem: NewAction = {
                      name: name,
                      description: '',
                      parentProjectId: null,
                      id: crypto.randomUUID(),
                      parentFolderId: item.id,
                      projectOwnerId: projectId,
                    };

                    try {
                      await databaseHelper.insertInto('action').values(newItem).execute();
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
                      of: 'action',
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
                  description: 'This action is irreversible',
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
            const items = await loadActions(extensionContext, projectId, item.id);
            context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await extensionContext.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.action-folder',
          dropAccepts: [
            'application/x.parsifly.action',
            'application/x.parsifly.action-folder',
          ],
          onDidDrop: async (_context, event) => {
            if (item.id === event.key) return;

            try {
              await databaseHelper
                .updateTable(event.mimeType === 'application/x.parsifly.action' ? 'action' : 'folder')
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
                .selectFrom('action')
                .select(['id'])
                .where('parentFolderId', '=', item.id)
                .unionAll(
                  databaseHelper
                    .selectFrom('folder')
                    .select(['id'])
                    .where('of', '=', 'action')
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

    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'action-global' },
        onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await extensionContext.edition.open('action', item.id);
        },
        getContextMenuItems: async () => {
          return [
            new Action({
              key: `delete:${item.id}`,
              initialValue: {
                label: 'Delete',
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                action: async () => {
                  await databaseHelper.deleteFrom('action').where('id', '=', item.id).execute();
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                },
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.action',
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

        const detailsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('action')
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
          await detailsSub();
        };
      },
    });
  });
}


export const loadActionsFolder = (extensionContext: TExtensionContext, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  let totalItems = 0;

  return new ListViewItem({
    key: 'actions-group',
    initialValue: {
      opened: true,
      label: 'Actions',
      children: true,
      disableSelect: true,
      icon: { type: 'action-global-folder' },
      onItemToggle: (context) => context.set('opened', !context.currentValue.opened),
      onItemDoubleClick: (context) => context.set('opened', !context.currentValue.opened),
      getItems: async (context) => {
        const items = await loadActions(extensionContext, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `new-action:${parentId}`,
            initialValue: {
              label: 'New action',
              icon: { type: 'action-global-add' },
              description: 'Add to this folder a new action',
              action: async () => {
                const name = await extensionContext.quickPick.show<string>({
                  title: 'Action name?',
                  placeholder: 'Example: Action1',
                  helpText: 'Type the name of the action.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem: NewAction = {
                  name: name,
                  description: '',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
                };

                try {
                  await databaseHelper.insertInto('action').values(newItem).execute();
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
                  of: 'action',
                  description: '',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
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
        ];
      },

      dropAccepts: [
        'application/x.parsifly.action',
        'application/x.parsifly.action-folder',
      ],
      onDidDrop: async (_context, event) => {
        try {
          await databaseHelper
            .updateTable(event.mimeType === 'application/x.parsifly.action' ? 'action' : 'folder')
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
            .selectFrom('action')
            .select(['id'])
            .where('parentProjectId', '=', projectId)
            .unionAll(
              databaseHelper
                .selectFrom('folder')
                .select(['id'])
                .where('of', '=', 'action')
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
