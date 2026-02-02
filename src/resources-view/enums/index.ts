import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';

import { NewFolder, NewEnum, NewEnumAttribute } from '../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { loadEnumAttributes } from './attributes';
import { loadEnumValuesFolder } from './values';


const loadEnums = async (extensionContext: TExtensionContext, projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('enum')
    .select(['id', 'name', 'type', 'description'])
    .where(builder => builder.or([
      builder('parentFolderId', '=', parentId),
      builder('parentProjectId', '=', parentId),
    ]))
    .unionAll(
      databaseHelper
        .selectFrom('folder')
        .select(['id', 'name', 'type', 'description'])
        .where('of', '=', 'enum')
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
          icon: { type: 'enum-folder' },
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
                  icon: { type: 'enum-add' },
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
                      await databaseHelper.insertInto('enum').values(newItem).execute();
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
                      of: 'enum',
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
                  description: 'This enum is irreversible',
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
            const items = await loadEnums(extensionContext, projectId, item.id);
            context.set('children', items.length > 0);
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
              await databaseHelper
                .updateTable(event.mimeType === 'application/x.parsifly.enum' ? 'enum' : 'folder')
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

          const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
          context.set('opened', openedIds ? openedIds.includes(item.id) : context.currentValue.opened);

          const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

          const itemsSub = await extensionContext.data.subscribe({
            query: (
              databaseHelper
                .selectFrom('enum')
                .select(['id'])
                .where('parentFolderId', '=', item.id)
                .unionAll(
                  databaseHelper
                    .selectFrom('folder')
                    .select(['id'])
                    .where('of', '=', 'enum')
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
        icon: { type: 'enum' },
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
          const items = await loadEnumAttributes(extensionContext, projectId, item);
          totalItems = items.length;
          return [
            enumValuesFolder,
            ...items,
          ];
        },
        getContextMenuItems: async (context) => {
          return [
            new Action({
              key: `new-enum-attribute:${item.id}`,
              initialValue: {
                label: 'New attribute',
                icon: { type: 'enum-add' },
                description: 'Add to this item a new attribute',
                action: async () => {
                  const name = await extensionContext.quickPick.show<string>({
                    title: 'Attribute name?',
                    placeholder: 'Example: Attribute1',
                    helpText: 'Type the name of the attribute.',
                  });
                  if (!name) return;

                  await context.set('opened', true);

                  const newItem: NewEnumAttribute = {
                    name: name,
                    description: '',
                    id: crypto.randomUUID(),
                    required: false,
                    dataType: 'string',
                    projectOwnerId: projectId,
                    parentEnumId: item.id,
                  };

                  try {
                    await databaseHelper.insertInto('enumAttribute').values(newItem).execute();
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
                description: 'This enum is irreversible',
                action: async () => {
                  await databaseHelper.deleteFrom('enum').where('id', '=', item.id).execute();
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                },
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.enum',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        context.set('selected', selectionIds.includes(item.id));

        const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
        context.set('opened', openedIds ? openedIds.includes(item.id) : context.currentValue.opened);

        const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

        const itemsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('enumAttribute')
              .select(['id'])
              .where(builder => builder.or([
                builder('parentEnumId', '=', item.id),
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
              .selectFrom('enum')
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
      icon: { type: 'enum-folder' },
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
              icon: { type: 'enum-add' },
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
                  await databaseHelper.insertInto('enum').values(newItem).execute();
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
                  of: 'enum',
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
        'application/x.parsifly.enum',
        'application/x.parsifly.enum-folder',
      ],
      onDidDrop: async (_context, event) => {
        try {
          await databaseHelper
            .updateTable(event.mimeType === 'application/x.parsifly.enum' ? 'enum' : 'folder')
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

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      context.set('opened', openedIds ? openedIds.includes('enums-group') : context.currentValue.opened);

      const itemsSub = await extensionContext.data.subscribe({
        query: (
          databaseHelper
            .selectFrom('enum')
            .select(['id'])
            .where('parentProjectId', '=', projectId)
            .unionAll(
              databaseHelper
                .selectFrom('folder')
                .select(['id'])
                .where('of', '=', 'enum')
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
