import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { dbQueryBuilder } from '../definition';


export const createActionFieldsDescriptor = (_application: TApplication) => {
  return new FieldsDescriptor({
    key: 'web-app-action-fields-descriptor',
    onGetFields: async (key) => {
      const action = await dbQueryBuilder
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
              const item = await dbQueryBuilder.selectFrom('action').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('action').where('id', '=', key).set('name', value).execute();
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
              const item = await dbQueryBuilder.selectFrom('action').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('action').where('id', '=', key).set('description', value).execute();
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
              const item = await dbQueryBuilder.selectFrom('action').select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await dbQueryBuilder.updateTable('action').set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

