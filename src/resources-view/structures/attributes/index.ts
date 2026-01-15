import { DatabaseError, ListViewItem, Action, TExtensionContext } from 'parsifly-extension-base';

import { NewStructureAttribute, Structure, StructureAttribute } from '../../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TParentDetails = Pick<Structure, 'id' | 'type'> | Pick<StructureAttribute, 'id' | 'type'>;
export const loadStructureAttributes = async (extensionContext: TExtensionContext, projectId: string, parent: TParentDetails): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .selectFrom('structureAttribute')
    .select(['id', 'name', 'type', 'description', 'dataType'])
    .where(builder => builder.or([
      builder('parentStructureId', '=', parent.id),
      builder('parentStructureAttributeId', '=', parent.id),
    ]))
    .orderBy('name', 'asc')
    .execute();


  return items.map(item => {
    let totalItems = 0;

    return new ListViewItem({
      key: item.id,
      initialValue: {
        children: false,
        label: item.name,
        icon: { type: 'structure-attribute' },
        onItemClick: async () => {
          await extensionContext.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(extensionContext, projectId, item);
          await context.set('children', items.length > 0);
          await context.set('icon', items.length > 0 ? { type: 'structure-substructure-attribute' } : { type: 'structure-attribute' });
          totalItems = items.length;
          return items;
        },
        getContextMenuItems: async (context) => {
          const itemValue = await databaseHelper.selectFrom('structureAttribute').select(['id', 'dataType']).where('id', '=', item.id).executeTakeFirstOrThrow();
          const newAttribute = new Action({
            key: `new-structure-attribute:${itemValue.id}`,
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
                  parentStructureId: null,
                  projectOwnerId: projectId,
                  parentStructureAttributeId: itemValue.id,
                };

                try {
                  await databaseHelper.insertInto('structureAttribute').values(newItem).execute();
                  await extensionContext.selection.select(newItem.id!);
                } catch (error) {
                  console.log(error);
                  if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                  else throw error;
                }
              },
            },
          });

          return [
            ...(itemValue.dataType === 'object' || itemValue.dataType === 'array_object' ? [newAttribute] : []),
            new Action({
              key: `delete:${itemValue.id}`,
              initialValue: {
                label: 'Delete',
                icon: { type: 'delete' },
                description: 'This action is irreversible',
                action: async () => {
                  await databaseHelper.deleteFrom('structureAttribute').where('id', '=', itemValue.id).execute();
                  const selectionId = await extensionContext.selection.get();
                  if (selectionId.includes(itemValue.id)) extensionContext.selection.unselect(itemValue.id);
                },
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.structure-attribute',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await extensionContext.selection.get();
        context.select(selectionIds.includes(item.id));

        const selectionSub = extensionContext.selection.subscribe(key => context.select(key.includes(item.id)));

        const itemsSub = await extensionContext.data.subscribe({
          query: (
            databaseHelper
              .selectFrom('structureAttribute')
              .select(['id'])
              .where(builder => builder.or([
                builder('parentStructureId', '=', parent.id),
                builder('parentStructureAttributeId', '=', parent.id),
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
              .selectFrom('structureAttribute')
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
