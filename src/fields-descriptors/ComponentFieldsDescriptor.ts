import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createComponentFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-component-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'component') return [];

      const component = await databaseHelper
        .selectFrom('component')
        .select(['id', 'name', 'description'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!component) return [];


      return [
        new FieldViewItem({
          key: `type:${component.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Component',
          },
        }),
        new FieldViewItem({
          key: `name:${component.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change component name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('component').where('id', '=', component.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('component').where('id', '=', component.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${component.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change component description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('component').where('id', '=', component.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('component').where('id', '=', component.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${component.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change component visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('component').where('id', '=', component.id).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('component').where('id', '=', component.id).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

