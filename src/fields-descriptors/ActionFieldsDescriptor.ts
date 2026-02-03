import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createActionFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-action-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'action') return [];

      const action = await databaseHelper
        .selectFrom('action')
        .select(['id', 'name', 'description'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!action) return [];


      return [
        new FieldViewItem({
          key: `type:${action.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Action',
          },
        }),
        new FieldViewItem({
          key: `name:${action.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change action name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', action.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('action').where('id', '=', action.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${action.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change action description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', action.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('action').where('id', '=', action.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${action.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change action visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('action').where('id', '=', action.id).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('action').where('id', '=', action.id).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

