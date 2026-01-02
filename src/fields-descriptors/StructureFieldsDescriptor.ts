import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createStructureFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new FieldsDescriptor({
    key: 'web-app-structure-fields-descriptor',
    onGetFields: async (key) => {
      const structure = await databaseHelper
        .selectFrom('structure')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!structure) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Structure',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structure').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structure').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${key}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change structure visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structure').where('id', '=', key).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('structure').where('id', '=', key).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

