import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../../definition/DatabaseHelper';
import { externalAction } from '../../../definition/schema';


export const createExternalActionFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalAction-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalAction') return [];

      const [result] = await databaseHelper
        .select({ id: externalAction.id })
        .from(externalAction)
        .where(eq(externalAction.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External action',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external action name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: externalAction.name })
                .from(externalAction)
                .where(eq(externalAction.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(externalAction)
                .set({ name: value })
                .where(eq(externalAction.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change external action description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: externalAction.description })
                .from(externalAction)
                .where(eq(externalAction.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(externalAction)
                .set({ description: value })
                .where(eq(externalAction.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external action visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: externalAction.public })
                .from(externalAction)
                .where(eq(externalAction.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(externalAction)
                .set({ public: value })
                .where(eq(externalAction.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

