import { ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';

import { Enum, EnumAttribute } from '../../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TParentDetails = Pick<Enum, 'id' | 'type'> | Pick<EnumAttribute, 'id' | 'type'>;
export const loadEnumAttributes = async (extensionContext: TExtensionContext, _projectId: string, parent: TParentDetails): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('enumAttribute')
    .select(['id', 'name', 'type', 'description', 'dataType'])
    .where(builder => builder.or([
      builder('parentEnumId', '=', parent.id),
    ]))
    .orderBy('name', 'asc')
    .execute();


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
          const itemValue = await databaseHelper.selectFrom('enumAttribute').select(['id', 'dataType']).where('id', '=', item.id).executeTakeFirstOrThrow();

          return [
            new Action({
              key: `delete:${itemValue.id}`,
              initialValue: {
                label: 'Delete',
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                action: async () => {
                  await databaseHelper.deleteFrom('enumAttribute').where('id', '=', itemValue.id).execute();
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(itemValue.id)) extensionContext.selection.unselect(itemValue.id);
                },
              },
            }),
          ];
        },

        //TODO: Ajustar no enum para receber  dragProvides: 'application/x.parsifly.enum-attribute',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        context.set('selected', selectionIds.includes(item.id));

        const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(item.id)));

        const detailsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('enumAttribute')
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
          await detailsSub();
        };
      },
    });
  });
}
