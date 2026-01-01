import { FieldsDescriptor, FieldViewItem, TApplication } from 'parsifly-extension-base';

import { dbQueryBuilder } from '../definition';


export const createProjectFieldsDescriptor = (_application: TApplication) => {
  return new FieldsDescriptor({
    key: 'web-app-project-fields-descriptor',
    onGetFields: async (key) => {
      const item = await dbQueryBuilder
        .selectFrom('project')
        .select(['name', 'description', 'public', 'version'])
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
            getValue: async () => 'project',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change project name',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('project').select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('project').set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change project description',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('project').select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('project').set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'text',
            name: 'version',
            label: 'Version',
            description: 'Change project version',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('project').select('version').executeTakeFirst()
              return item?.version || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await dbQueryBuilder.updateTable('project').set('version', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change project visibility',
            getValue: async () => {
              const item = await dbQueryBuilder.selectFrom('project').select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await dbQueryBuilder.updateTable('project').set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

