import { ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';
import { asc, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { Enum, EnumProperty, enumProperty } from '../../../definition/schema';


type TParentDetails = Pick<Enum, 'id' | 'type'> | Pick<EnumProperty, 'id' | 'type'>;
export const loadEnumProperties = async (extensionContext: TExtensionContext, _projectId: string, parent: TParentDetails): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({
      id: enumProperty.id,
      name: enumProperty.name,
      type: enumProperty.type,
      description: enumProperty.description,
    })
    .from(enumProperty)
    .where(eq(enumProperty.parentEnumId, parent.id))
    .orderBy(asc(enumProperty.name));


  return items.map(item => {
    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'enum-attribute' },
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
        },
        getContextMenuItems: async () => {
          const [itemValue] = await databaseHelper
            .select({
              id: enumProperty.id,
              dataType: enumProperty.dataType,
            })
            .from(enumProperty)
            .where(eq(enumProperty.id, item.id));

          return [
            new Action({
              key: `delete:${itemValue.id}`,
              initialValue: {
                label: 'Delete',
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                action: async () => {
                  await databaseHelper.delete(enumProperty).where(eq(enumProperty.id, itemValue.id));
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(itemValue.id)) extensionContext.selection.unselect(itemValue.id);
                },
              },
            }),
          ];
        },

        //TODO: Ajustar no enum para receber  dragProvides: 'application/x.parsifly.enum-property',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        context.set('selected', selectionIds.includes(item.id));

        const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

        const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
          databaseHelper
            .select({
              id: enumProperty.id,
              name: enumProperty.name,
              description: enumProperty.description,
            })
            .from(enumProperty)
            .where(eq(enumProperty.id, item.id))
        );
        const detailsSub = await extensionContext.data.subscribe({
          query: itemDetailQuery,
          listener: async (data) => {
            const [itemChanged] = itemDetailMapResult(data);
            context.set('label', itemChanged.name || '');
            context.set('description', itemChanged.description || '');
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
