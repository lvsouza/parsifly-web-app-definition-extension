import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createActionFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new FieldsDescriptor({
    key: 'web-app-action-fields-descriptor',
    onGetFields: async (key) => {
      const action = await databaseHelper
        .selectFrom('action')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!action) return [];

      return [
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'action',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change action name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('action').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change action description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('action').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change action visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', key).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('action').where('id', '=', key).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

