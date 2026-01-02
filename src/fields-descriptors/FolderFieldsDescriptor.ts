import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createFolderFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);


  return new FieldsDescriptor({
    key: 'web-app-folder-fields-descriptor',
    onGetFields: async (key) => {
      const item = await databaseHelper
        .selectFrom('folder')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!item) return [];

      return [
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'folder',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change folder name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('folder').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('folder').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change folder description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('folder').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('folder').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
      ];
    }
  });
}

