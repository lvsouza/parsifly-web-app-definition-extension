import { ListViewItem, Action, TExtensionContext, DatabaseError } from 'parsifly-extension-base';
import { asc, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { enumValue, NewEnumValue } from '../../../definition/schema';


const loadEnumValues = async (extensionContext: TExtensionContext, _projectId: string, parentId: string): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({
      id: enumValue.id,
      name: enumValue.name,
    })
    .from(enumValue)
    .where(eq(enumValue.parentEnumId, parentId))
    .orderBy(asc(enumValue.name));


  return items.map(item => {
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { path: 'enum-value.svg' },
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
                  await databaseHelper.delete(enumValue).where(eq(enumValue.id, item.id));
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

        const selectionIds = await extensionContext.selection.get();
        await context.set('selected', selectionIds.includes(item.id));

        const selectionSub = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(item.id)));

        const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
          databaseHelper
            .select({
              id: enumValue.id,
              name: enumValue.name,
            })
            .from(enumValue)
            .where(eq(enumValue.id, item.id))
        );
        const detailsSub = await extensionContext.data.subscribe({
          query: itemDetailQuery,
          listener: async (data) => {
            const [itemChanged] = itemDetailMapResult(data);
            await context.set('label', itemChanged.name || '');
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
      icon: { path: 'enum-value-folder.svg' },
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
              icon: { path: 'enum.svg' },
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
                  await databaseHelper.insert(enumValue).values(newItem);
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
      await context.set('opened', openedIds ? openedIds.includes(`enums-value-group-${parentId}`) : context.currentValue.opened);

      const [itemsQuery, itemsMapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumValue.id,
          })
          .from(enumValue)
          .where(eq(enumValue.parentEnumId, parentId))
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
