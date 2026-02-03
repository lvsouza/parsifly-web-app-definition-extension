import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createPageFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-page-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'page') return [];

      const page = await databaseHelper
        .selectFrom('page')
        .select(['id', 'name', 'description'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!page) return [];


      return [
        new FieldViewItem({
          key: `type:${page.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Page',
          },
        }),
        new FieldViewItem({
          key: `name:${page.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change page name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', page.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('page').where('id', '=', page.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${page.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change page description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', page.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('page').where('id', '=', page.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${page.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change page visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('page').where('id', '=', page.id).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('page').where('id', '=', page.id).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

