import { ContextMenuItem, DatabaseError, ListViewItem, TApplication } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { NewFolder, NewPage } from '../../definition/DatabaseTypes';


const loadPages = async (application: TApplication, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(application);

  const items = await databaseHelper
    .selectFrom('page')
    .select(['id', 'name', 'type', 'description'])
    .where(builder => builder.or([
      builder('parentFolderId', '=', parentId),
      builder('parentProjectId', '=', parentId),
    ]))
    .unionAll(
      databaseHelper
        .selectFrom('folder')
        .select(['id', 'name', 'type', 'description'])
        .where('of', '=', 'page')
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
          icon: { type: 'page-folder' },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New page',
                icon: { type: 'page-add' },
                key: `new-page:${item.id}`,
                description: 'Add to this folder a new page',
                onClick: async () => {
                  const name = await application.quickPick.show<string>({
                    title: 'Page name?',
                    placeholder: 'Example: Page1',
                    helpText: 'Type the name of the page.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewPage = {
                    name: name,
                    description: '',
                    parentProjectId: null,
                    id: crypto.randomUUID(),
                    parentFolderId: item.id,
                    projectOwnerId: projectId,
                  };

                  try {
                    await databaseHelper.insertInto('page').values(newItem).execute();
                    await application.selection.select(newItem.id!);
                  } catch (error) {
                    if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                    else throw error;
                  }
                },
              }),
              new ContextMenuItem({
                label: 'New folder',
                key: `new-folder:${item.id}`,
                icon: { type: 'folder-add' },
                description: 'Add to this folder a new folder',
                onClick: async () => {
                  const name = await application.quickPick.show<string>({
                    title: 'Folder name',
                    placeholder: 'Example: Folder1',
                    helpText: 'Type the name of the folder.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewFolder = {
                    of: 'page',
                    name: name,
                    description: '',
                    parentProjectId: null,
                    id: crypto.randomUUID(),
                    parentFolderId: item.id,
                    projectOwnerId: projectId,
                  };

                  try {
                    await databaseHelper.insertInto('folder').values(newItem).execute();
                    await application.selection.select(newItem.id!);
                  } catch (error) {
                    if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                    else throw error;
                  }
                },
              }),
              new ContextMenuItem({
                label: 'Delete',
                key: `delete:${item.id}`,
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                onClick: async () => {
                  await databaseHelper.deleteFrom('folder').where('id', '=', item.id).execute();
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadPages(application, projectId, item.id);
            context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.page-folder',
          dropAccepts: [
            'application/x.parsifly.page',
            'application/x.parsifly.page-folder',
          ],
          onDidDrop: async (_context, event) => {
            if (item.id === event.key) return;

            try {
              await databaseHelper
                .updateTable(event.mimeType === 'application/x.parsifly.page' ? 'page' : 'folder')
                .set('parentFolderId', item.id)
                .set('parentProjectId', null)
                .where('id', '=', event.key)
                .execute();
            } catch (error) {
              if (DatabaseError.as(error).code === 'P1001') application.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
              else if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information');
              else throw error;
            }
          },
        },
        onDidMount: async (context) => {
          context.set('label', item.name);
          context.set('description', item.description || '');

          const selectionIds = await application.selection.get();
          context.select(selectionIds.includes(item.id));

          const editionSub = application.edition.subscribe(key => context.edit(key === item.id));
          const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));

          const itemsSub = await application.data.subscribe({
            query: (
              databaseHelper
                .selectFrom('page')
                .select(['id'])
                .where('parentFolderId', '=', item.id)
                .unionAll(
                  databaseHelper
                    .selectFrom('folder')
                    .select(['id'])
                    .where('parentFolderId', '=', item.id)
                )
                .compile()
            ),
            listener: async (data) => {
              if (totalItems === data.rows.length) return;
              await context.refetchChildren()
            },
          });
          const detailsSub = await application.data.subscribe({
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

          context.onDidUnmount(async () => {
            editionSub();
            selectionSub();
            await itemsSub();
            await detailsSub();
          });
        },
      })
    }

    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'page' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await application.edition.open('page', item.id);
        },
        getContextMenuItems: async () => {
          return [
            new ContextMenuItem({
              label: 'Delete',
              key: `delete:${item.id}`,
              icon: { type: 'delete' },
              description: 'This action is irreversible',
              onClick: async () => {
                await databaseHelper.deleteFrom('page').where('id', '=', item.id).execute();
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.page',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await application.selection.get();
        const editionId = await application.edition.get();
        context.select(selectionIds.includes(item.id));
        context.edit(editionId === item.id);

        const editionSub = application.edition.subscribe(key => context.edit(key === item.id));
        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));

        const detailsSub = await application.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('page')
              .select(['id', 'name', 'description'])
              .where('id', '=', item.id)
              .compile()
          ),
          listener: async ({ rows: [itemChanged] }) => {
            context.set('label', itemChanged.name || '');
            context.set('description', itemChanged.description || '');
          },
        });

        context.onDidUnmount(async () => {
          editionSub();
          selectionSub();
          await detailsSub();
        });
      },
    });
  });
}


export const loadPagesFolder = (application: TApplication, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(application);

  let totalItems = 0;

  return new ListViewItem({
    key: 'pages-group',
    initialValue: {
      opened: true,
      label: 'Pages',
      children: true,
      disableSelect: true,
      icon: { type: 'page-folder' },
      getItems: async (context) => {
        const items = await loadPages(application, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New page',
            icon: { type: 'page-add' },
            key: `new-page:${parentId}`,
            description: 'Add to this folder a new page',
            onClick: async () => {
              const name = await application.quickPick.show<string>({
                title: 'Page name?',
                placeholder: 'Example: Page1',
                helpText: 'Type the name of the page.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem: NewPage = {
                name: name,
                description: '',
                parentFolderId: null,
                id: crypto.randomUUID(),
                projectOwnerId: projectId,
                parentProjectId: parentId,
              };

              try {
                await databaseHelper.insertInto('page').values(newItem).execute();
                await application.selection.select(newItem.id!);
              } catch (error) {
                if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                else throw error;
              }
            },
          }),
          new ContextMenuItem({
            label: 'New folder',
            key: `new-folder:${parentId}`,
            icon: { type: 'folder-add' },
            description: 'Add to this folder a new folder',
            onClick: async () => {
              const name = await application.quickPick.show<string>({
                title: 'Folder name',
                placeholder: 'Example: Folder1',
                helpText: 'Type the name of the folder.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem: NewFolder = {
                name: name,
                of: 'page',
                description: '',
                parentFolderId: null,
                id: crypto.randomUUID(),
                projectOwnerId: projectId,
                parentProjectId: parentId,
              };

              try {
                await databaseHelper.insertInto('folder').values(newItem).execute();
                await application.selection.select(newItem.id!);
              } catch (error) {
                if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                else throw error;
              }
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.page',
        'application/x.parsifly.page-folder',
      ],
      onDidDrop: async (_context, event) => {
        try {
          await databaseHelper
            .updateTable(event.mimeType === 'application/x.parsifly.page' ? 'page' : 'folder')
            .set('parentFolderId', null)
            .set('parentProjectId', parentId)
            .where('id', '=', event.key)
            .execute();
        } catch (error) {
          if (DatabaseError.as(error).code === 'P1001') application.feedback.error(DatabaseError.as(error).detail || 'Invalid hierarchy');
          else if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information');
          else throw error;
        }
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await application.data.subscribe({
        query: (
          databaseHelper
            .selectFrom('page')
            .select(['id'])
            .where('parentProjectId', '=', projectId)
            .unionAll(
              databaseHelper
                .selectFrom('folder')
                .select(['id'])
                .where('of', '=', 'page')
                .where('parentProjectId', '=', projectId)
            )
            .compile()
        ),
        listener: async (data) => {
          if (totalItems === data.rows.length) return;
          await context.refetchChildren()
        },
      });

      context.onDidUnmount(async () => {
        await itemsSub();
      });
    },
  });
};
