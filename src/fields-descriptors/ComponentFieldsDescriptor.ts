import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { dbQueryBuilder } from '../definition';


export const createComponentFieldsDescriptor = (_application: TApplication) => {
  return new FieldsDescriptor({
    key: 'web-app-component-fields-descriptor',
    onGetFields: async (key) => {
      const component = await dbQueryBuilder
        .selectFrom('component')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!component) return [];

      return [
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'component',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change component name',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('component').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('component').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change component description',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('component').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('component').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change component visibility',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('component').select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await dbQueryBuilder.updateTable('component').set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

