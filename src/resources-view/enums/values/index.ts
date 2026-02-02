import { ListViewItem, Action, TExtensionContext, DatabaseError } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../../../definition/DatabaseHelper';
import { NewEnumValue } from '../../../definition/DatabaseTypes';


const loadEnumValues = async (extensionContext: TExtensionContext, _projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('enumValue')
    .select(['id', 'name'])
    .where(builder => builder.or([
      builder('parentEnumId', '=', parentId),
    ]))
    .orderBy('name', 'asc')
    .execute();


  return items.map(item => {
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'enum-value' },
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
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
                  await databaseHelper.deleteFrom('enumValue').where('id', '=', item.id).execute();
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(item.id)) extensionContext.selection.unselect(item.id);
                },
              },
            }),
          ];
        },
      },
      onDidMount: async (context) => {
        context.set('label', item.name);

        const selectionIds = await extensionContext.selection.get();
        context.set('selected', selectionIds.includes(item.id));

        const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

        const detailsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('enumValue')
              .select(['id', 'name'])
              .where('id', '=', item.id)
              .compile()
          ),
          listener: async ({ rows: [itemChanged] }) => {
            context.set('label', itemChanged.name || '');
          },
        });

        return async () => {
          selectionSub();
          await detailsSub();
        };
      },
    });
  });
}

export const loadEnumValuesFolder = (extensionContext: TExtensionContext, projectId: string, parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  let totalItems = 0;

  return new ListViewItem({
    key: `enums-value-group-${parentId}`,
    initialValue: {
      opened: true,
      children: true,
      label: 'Values',
      disableSelect: true,
      icon: { type: 'folder' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `enums-value-group-${parentId}`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `enums-value-group-${parentId}`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `enums-value-group-${parentId}`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `enums-value-group-${parentId}`));
        }
      },
      getItems: async (context) => {
        const items = await loadEnumValues(extensionContext, projectId, parentId);
        await context.set('children', items.length > 0);
        totalItems = items.length;
        return items;
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `new-enum-value:${parentId}`,
            initialValue: {
              label: 'New enum value',
              icon: { type: 'enum-add' },
              description: 'Add to this enum a new value',
              action: async () => {
                const name = await extensionContext.quickPick.show<string>({
                  title: 'Enum value name?',
                  placeholder: 'Example: EnumValue1',
                  helpText: 'Type the name of the enum value.',
                });
                if (!name) return;

                await context.set('opened', true);

                const newItem: NewEnumValue = {
                  name: name,
                  parentEnumId: parentId,
                  id: crypto.randomUUID(),
                  projectOwnerId: projectId,
                };

                try {
                  await databaseHelper.insertInto('enumValue').values(newItem).execute();
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
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      context.set('opened', openedIds ? openedIds.includes(`enums-value-group-${parentId}`) : context.currentValue.opened);

      const itemsSub = await extensionContext.data.subscribe({
        query: (
          databaseHelper
            .selectFrom('enumValue')
            .select(['id'])
            .where('parentEnumId', '=', parentId)
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
