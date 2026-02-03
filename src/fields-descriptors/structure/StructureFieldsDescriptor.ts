import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createStructureFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-structure-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'structure') return [];

      const structure = await databaseHelper
        .selectFrom('structure')
        .select(['id', 'name', 'description'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!structure) return [];


      return [
        new FieldViewItem({
          key: `type:${structure.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Structure',
          },
        }),
        new FieldViewItem({
          key: `name:${structure.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', structure.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structure').where('id', '=', structure.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${structure.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', structure.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structure').where('id', '=', structure.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${structure.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change structure visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', structure.id).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('structure').where('id', '=', structure.id).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

