import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { dbQueryBuilder } from '../definition';


export const createPageFieldsDescriptor = (_application: TApplication) => {
  return new FieldsDescriptor({
    key: 'web-app-page-fields-descriptor',
    onGetFields: async (key) => {
      const page = await dbQueryBuilder
        .selectFrom('page')
        .select(['name', 'description'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!page) return [];

      return [
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'page',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change page name',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('page').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('page').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change page description',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('page').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('page').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
      ];
    }
  });
}

