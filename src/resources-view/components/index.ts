import { ContextMenuItem, ListViewItem, TApplication } from 'parsifly-extension-base';

import { NewFolder, NewComponent } from '../../definition/DatabaseTypes';
import { dbQueryBuilder } from '../../definition';


const loadComponents = async (application: TApplication, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const items = await dbQueryBuilder
    .selectFrom('component')
    .select(['id', 'name', 'type', 'description'])
    .where(builder => builder.or([
      builder('parentFolderId', '=', parentId),
      builder('parentProjectId', '=', parentId),
    ]))
    .unionAll(
      dbQueryBuilder
        .selectFrom('folder')
        .select(['id', 'name', 'type', 'description'])
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
          icon: { type: 'component-folder' },
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                label: 'New component',
                icon: { type: 'component-add' },
                key: `new-component:${item.id}`,
                description: 'Add to this folder a new component',
                onClick: async () => {
                  const name = await application.quickPick.show<string>({
                    title: 'Component name?',
                    placeholder: 'Example: Component1',
                    helpText: 'Type the name of the component.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewComponent = {
                    name: name,
                    description: '',
                    parentProjectId: null,
                    id: crypto.randomUUID(),
                    parentFolderId: item.id,
                    projectOwnerId: projectId,
                  };

                  await dbQueryBuilder.insertInto('component').values(newItem).execute();
                  await application.selection.select(newItem.id!);
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
                    name: name,
                    description: '',
                    parentProjectId: null,
                    id: crypto.randomUUID(),
                    parentFolderId: item.id,
                    projectOwnerId: projectId,
                  };

                  await dbQueryBuilder.insertInto('folder').values(newItem).execute();
                  await application.selection.select(newItem.id!);
                },
              }),
              new ContextMenuItem({
                label: 'Delete',
                key: `delete:${item.id}`,
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                onClick: async () => {
                  await dbQueryBuilder.deleteFrom('folder').where('id', '=', item.id).execute();
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadComponents(application, projectId, item.id);
            context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
          },

          dragProvides: 'application/x.parsifly.component-folder',
          dropAccepts: [
            'application/x.parsifly.component',
            'application/x.parsifly.component-folder',
          ],
          onDidDrop: async (_context, event) => {
            await dbQueryBuilder
              .updateTable(event.mimeType === 'application/x.parsifly.component' ? 'component' : 'folder')
              .set('parentFolderId', item.id)
              .set('parentProjectId', null)
              .where('id', '=', event.key)
              .execute();
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
              dbQueryBuilder
                .selectFrom('component')
                .select(['id'])
                .where('parentFolderId', '=', item.id)
                .unionAll(
                  dbQueryBuilder
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
              dbQueryBuilder
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
        icon: { type: 'component' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        onItemDoubleClick: async () => {
          await application.edition.open('component', item.id);
        },
        getContextMenuItems: async () => {
          return [
            new ContextMenuItem({
              label: 'Delete',
              key: `delete:${item.id}`,
              icon: { type: 'delete' },
              description: 'This action is irreversible',
              onClick: async () => {
                await dbQueryBuilder.deleteFrom('component').where('id', '=', item.id).execute();
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.component',
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
            dbQueryBuilder
              .selectFrom('component')
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


export const loadComponentsFolder = (application: TApplication, projectId: string, parentId: string) => {

  let totalItems = 0;

  return new ListViewItem({
    key: 'components-group',
    initialValue: {
      opened: true,
      label: 'Components',
      children: true,
      disableSelect: true,
      icon: { type: 'component-folder' },
      getItems: async (context) => {
        const items = await loadComponents(application, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            label: 'New component',
            icon: { type: 'component-add' },
            key: `new-component:${parentId}`,
            description: 'Add to this folder a new component',
            onClick: async () => {
              const name = await application.quickPick.show<string>({
                title: 'Component name?',
                placeholder: 'Example: Component1',
                helpText: 'Type the name of the component.',
              });
              if (!name) return;

              await context.set('opened', true);

              const newItem: NewComponent = {
                name: name,
                description: '',
                parentFolderId: null,
                id: crypto.randomUUID(),
                projectOwnerId: projectId,
                parentProjectId: parentId,
              };

              await dbQueryBuilder.insertInto('component').values(newItem).execute();
              await application.selection.select(newItem.id!);
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
                description: '',
                parentFolderId: null,
                id: crypto.randomUUID(),
                projectOwnerId: projectId,
                parentProjectId: parentId,
              };

              await dbQueryBuilder.insertInto('folder').values(newItem).execute();
              await application.selection.select(newItem.id!);
            },
          }),
        ];
      },

      dropAccepts: [
        'application/x.parsifly.component',
        'application/x.parsifly.component-folder',
      ],
      onDidDrop: async (_context, event) => {
        await dbQueryBuilder
          .updateTable(event.mimeType === 'application/x.parsifly.component' ? 'component' : 'folder')
          .set('parentFolderId', null)
          .set('parentProjectId', parentId)
          .where('id', '=', event.key)
          .execute();
      },
    },
    onDidMount: async (context) => {
      const itemsSub = await application.data.subscribe({
        query: (
          dbQueryBuilder
            .selectFrom('component')
            .select(['id'])
            .where('parentProjectId', '=', projectId)
            .unionAll(
              dbQueryBuilder
                .selectFrom('folder')
                .select(['id'])
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
