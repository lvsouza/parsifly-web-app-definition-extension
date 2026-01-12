import { FieldsDescriptor, FieldViewItem, TApplication, TSerializableDiagnosticViewItem } from 'parsifly-extension-base';

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
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Folder',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
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
          onDidMount: async (context) => {
            const handleDiagnostics = async (diagnostics: Record<string, TSerializableDiagnosticViewItem[]>) => {
              let changed = false;
              for (const diagnosticViewItem of Object.entries(diagnostics).flatMap(([, diagnosticViewItems]) => diagnosticViewItems)) {
                if (diagnosticViewItem.target.resourceId === key && diagnosticViewItem.target.property === 'name') {
                  await context.set(diagnosticViewItem.severity, diagnosticViewItem.message);
                  changed = true;
                  break;
                }
              }

              if (!changed) {
                await context.set('warning', undefined);
                await context.set('error', undefined);
                await context.set('info', undefined);
              }
            }


            const diagnostics = await application.diagnostics.get();
            await handleDiagnostics(diagnostics);


            const diagnosticSubscription = application.diagnostics.subscribe(handleDiagnostics);


            context.onDidUnmount(async () => {
              diagnosticSubscription();
            });
          }
        }),
        new FieldViewItem({
          key: `description:${key}`,
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

