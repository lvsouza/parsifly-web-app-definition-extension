import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createPageFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new FieldsDescriptor({
    key: 'web-app-page-fields-descriptor',
    onGetFields: async (key) => {
      const page = await databaseHelper
        .selectFrom('page')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!page) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Page',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change page name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('page').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change page description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('page').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${key}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change page visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', key).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('page').where('id', '=', key).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

