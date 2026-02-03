import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createProjectFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-project-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'project') return [];

      const project = await databaseHelper
        .selectFrom('project')
        .select(['id', 'name', 'description', 'public', 'version'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!project) return [];


      return [
        new FieldViewItem({
          key: `type:${project.id}`,
          initialValue: {
            type: 'view',
            name: 'type',
            label: 'Type',
            getValue: async () => 'Project',
          },
        }),
        new FieldViewItem({
          key: `projectType:${project.id}`,
          initialValue: {
            type: 'view',
            name: 'projectType',
            label: 'Project type',
            getValue: async () => 'Web app',
          },
        }),
        new FieldViewItem({
          key: `name:${project.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change project name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', project.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', project.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${project.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change project description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', project.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', project.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `version:${project.id}`,
          initialValue: {
            type: 'text',
            name: 'version',
            label: 'Version',
            description: 'Change project version',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', project.id).select('version').executeTakeFirst()
              return item?.version || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('project').where('id', '=', project.id).set('version', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${project.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change project visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('project').where('id', '=', project.id).select('public').executeTakeFirst()
              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('project').where('id', '=', project.id).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

