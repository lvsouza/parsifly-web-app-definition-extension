import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { externalComponent } from '../../definition/schema';


export const createExternalComponentFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalComponent-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalComponent') return [];

      const [result] = await databaseHelper
        .select({ id: externalComponent.id })
        .from(externalComponent)
        .where(eq(externalComponent.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External component',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external component name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: externalComponent.name })
                .from(externalComponent)
                .where(eq(externalComponent.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(externalComponent)
                .set({ name: value })
                .where(eq(externalComponent.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change external component description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: externalComponent.description })
                .from(externalComponent)
                .where(eq(externalComponent.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(externalComponent)
                .set({ description: value })
                .where(eq(externalComponent.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external component visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: externalComponent.public })
                .from(externalComponent)
                .where(eq(externalComponent.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(externalComponent)
                .set({ public: value })
                .where(eq(externalComponent.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

