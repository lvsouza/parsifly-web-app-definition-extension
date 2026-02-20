import { FieldsDescriptor, FieldViewItem, TExtensionContext, TSerializableDiagnosticViewItem } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { folder } from '../definition/schema';


export const createFolderFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new FieldsDescriptor({
    key: 'web-app-folder-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'folder') return [];

      const [result] = await databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          description: folder.description,
        })
        .from(folder)
        .where(eq(folder.id, target.id));

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Folder',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change folder name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: folder.name,
                })
                .from(folder)
                .where(eq(folder.id, result.id))
                .limit(1);

              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(folder)
                .set({ name: value })
                .where(eq(folder.id, result.id))
            },
          },
          onDidMount: async (context) => {
            const handleDiagnostics = async (diagnostics: Record<string, TSerializableDiagnosticViewItem[]>) => {
              let changed = false;

              for (const diagnosticViewItem of Object.entries(diagnostics).flatMap(([, diagnosticViewItems]) => diagnosticViewItems)) {
                if (diagnosticViewItem.target.resourceId === result.id && diagnosticViewItem.target.property === 'name') {
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


            const diagnostics = await extensionContext.diagnostics.get();
            await handleDiagnostics(diagnostics);


            const diagnosticSubscription = extensionContext.diagnostics.subscribe(handleDiagnostics);


            return async () => {
              diagnosticSubscription();
            };
          }
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change folder description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  description: folder.description,
                })
                .from(folder)
                .where(eq(folder.id, result.id))
                .limit(1);

              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(folder)
                .set({ description: value })
                .where(eq(folder.id, result.id));
            },
          }
        }),
      ];
    }
  });
}

