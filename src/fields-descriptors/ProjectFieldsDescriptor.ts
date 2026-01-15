import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createProjectFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-project-fields-descriptor',
    onGetFields: async (key) => {
      const item = await databaseHelper
        .selectFrom('project')
        .select(['name', 'description', 'public', 'version'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!item) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Web app',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change project name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change project description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `version:${key}`,
          initialValue: {
            type: 'text',
            name: 'version',
            label: 'Version',
            description: 'Change project version',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', key).select('version').executeTakeFirst()
              return item?.version || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', key).set('version', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${key}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change project visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', key).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('project').where('id', '=', key).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

