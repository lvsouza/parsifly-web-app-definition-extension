import { ContextMenuItem, DatabaseError, ListViewItem, TApplication } from 'parsifly-extension-base';

import { NewFolder, NewStructure, NewStructureAttribute } from '../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { loadStructureAttributes } from './attributes';


const loadStructures = async (application: TApplication, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(application);

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
          getContextMenuItems: async (context) => {
            return [
              new ContextMenuItem({
                key: `new-structure:${item.id}`,
                initialValue: {
                  label: 'New structure',
                  icon: { type: 'structure-add' },
                  description: 'Add to this folder a new structure',
                  onClick: async () => {
                    const name = await application.quickPick.show<string>({
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
                      await application.selection.select(newItem.id!);
                    } catch (error) {
                      if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                      else throw error;
                    }
                  },
                },
              }),
              new ContextMenuItem({
                key: `new-folder:${item.id}`,
                initialValue: {
                  label: 'New folder',
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
                      of: 'structure',
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
                },
              }),
              new ContextMenuItem({
                key: `delete:${item.id}`,
                initialValue: {
                  label: 'Delete',
                  icon: { type: 'delete' },
                  description: 'This structure is irreversible',
                  onClick: async () => {
                    await databaseHelper.deleteFrom('folder').where('id', '=', item.id).execute();
                    const selectionId = await application.selection.get();
                    if (selectionId.includes(item.id)) application.selection.unselect(item.id);
                  },
                },
              }),
            ];
          },
          getItems: async (context) => {
            const items = await loadStructures(application, projectId, item.id);
            context.set('children', items.length > 0);
            totalItems = items.length;
            return items;
          },
          onItemClick: async () => {
            await application.selection.select(item.id);
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

    let totalItems = 0;
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'structure' },
        onItemClick: async () => {
          await application.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(application, projectId, item);
          await context.set('children', items.length > 0);
          totalItems = items.length;
          return items
        },
        getContextMenuItems: async (context) => {
          return [
            new ContextMenuItem({
              key: `new-structure-attribute:${item.id}`,
              initialValue: {
                label: 'New attribute',
                icon: { type: 'structure-add' },
                description: 'Add to this item a new attribute',
                onClick: async () => {
                  const name = await application.quickPick.show<string>({
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
                    await application.selection.select(newItem.id!);
                  } catch (error) {
                    if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                    else throw error;
                  }
                },
              },
            }),
            new ContextMenuItem({
              key: `delete:${item.id}`,
              initialValue: {
                label: 'Delete',
                icon: { type: 'delete' },
                description: 'This structure is irreversible',
                onClick: async () => {
                  await databaseHelper.deleteFrom('structure').where('id', '=', item.id).execute();
                  const selectionId = await application.selection.get();
                  if (selectionId.includes(item.id)) application.selection.unselect(item.id);
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

        const selectionIds = await application.selection.get();
        const editionId = await application.edition.get();
        context.select(selectionIds.includes(item.id));
        context.edit(editionId === item.id);

        const editionSub = application.edition.subscribe(key => context.edit(key === item.id));
        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));

        const itemsSub = await application.data.subscribe({
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
        const detailsSub = await application.data.subscribe({
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

        context.onDidUnmount(async () => {
          editionSub();
          selectionSub();
          await itemsSub();
          await detailsSub();
        });
      },
    });
  });
}


export const loadStructuresFolder = (application: TApplication, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(application);

  let totalItems = 0;

  return new ListViewItem({
    key: 'structures-group',
    initialValue: {
      opened: true,
      label: 'Structures',
      children: true,
      disableSelect: true,
      icon: { type: 'structure-folder' },
      getItems: async (context) => {
        const items = await loadStructures(application, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new ContextMenuItem({
            key: `new-structure:${parentId}`,
            initialValue: {
              label: 'New structure',
              icon: { type: 'structure-add' },
              description: 'Add to this folder a new structure',
              onClick: async () => {
                const name = await application.quickPick.show<string>({
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
                  await application.selection.select(newItem.id!);
                } catch (error) {
                  if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                  else throw error;
                }
              },
            },
          }),
          new ContextMenuItem({
            key: `new-folder:${parentId}`,
            initialValue: {
              label: 'New folder',
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
                  of: 'structure',
                  parentFolderId: null,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                  parentProjectId: parentId,
                };

                try {
                  await databaseHelper.insertInto('folder').values(newItem).execute();
                  await application.selection.select(newItem.id!);
                } catch (error) {
                  if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information');
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

      context.onDidUnmount(async () => {
        await itemsSub();
      });
    },
  });
};
