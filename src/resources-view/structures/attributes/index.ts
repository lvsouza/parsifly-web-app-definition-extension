import { ContextMenuItem, DatabaseError, ListViewItem, TApplication } from 'parsifly-extension-base';

import { NewStructureAttribute, Structure, StructureAttribute } from '../../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TParentDetails = Pick<Structure, 'id' | 'type'> | Pick<StructureAttribute, 'id' | 'type'>;
export const loadStructureAttributes = async (application: TApplication, projectId: string, parent: TParentDetails): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(application);

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
          await application.selection.select(item.id);
        },
        getItems: async (context) => {
          const items = await loadStructureAttributes(application, projectId, item);
          await context.set('children', items.length > 0);
          await context.set('icon', items.length > 0 ? { type: 'structure-substructure-attribute' } : { type: 'structure-attribute' });
          totalItems = items.length;
          return items;
        },
        getContextMenuItems: async (context) => {
          const itemValue = await databaseHelper.selectFrom('structureAttribute').select(['id', 'dataType']).where('id', '=', item.id).executeTakeFirstOrThrow();
          const newAttribute = new ContextMenuItem({
            label: 'New attribute',
            icon: { type: 'structure-add' },
            key: `new-structure-attribute:${itemValue.id}`,
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
                parentStructureId: null,
                projectOwnerId: projectId,
                parentStructureAttributeId: itemValue.id,
              };

              try {
                await databaseHelper.insertInto('structureAttribute').values(newItem).execute();
                await application.selection.select(newItem.id!);
              } catch (error) {
                console.log(error);
                if (DatabaseError.as(error).code === '23505') application.feedback.error('Duplicated information')
                else throw error;
              }
            },
          });

          return [
            ...(itemValue.dataType === 'object' || itemValue.dataType === 'array_object' ? [newAttribute] : []),
            new ContextMenuItem({
              label: 'Delete',
              key: `delete:${itemValue.id}`,
              icon: { type: 'delete' },
              description: 'This action is irreversible',
              onClick: async () => {
                await databaseHelper.deleteFrom('structureAttribute').where('id', '=', itemValue.id).execute();
                const selectionId = await application.selection.get();
                if (selectionId.includes(itemValue.id)) application.selection.unselect(itemValue.id);
              },
            }),
          ];
        },

        dragProvides: 'application/x.parsifly.structure-attribute',
      },
      onDidMount: async (context) => {
        context.set('label', item.name);
        context.set('description', item.description || '');

        const selectionIds = await application.selection.get();
        context.select(selectionIds.includes(item.id));

        const selectionSub = application.selection.subscribe(key => context.select(key.includes(item.id)));

        const itemsSub = await application.data.subscribe({
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
          selectionSub();
          await itemsSub();
          await detailsSub();
        });
      },
    });
  });
}
