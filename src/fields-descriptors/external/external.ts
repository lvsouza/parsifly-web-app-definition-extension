import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { external } from '../../definition/schema';


export const createExternalFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-external-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'external') return [];

      const [result] = await databaseHelper
        .select({ id: external.id })
        .from(external)
        .where(eq(external.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: external.name })
                .from(external)
                .where(eq(external.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(external)
                .set({ name: value })
                .where(eq(external.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change external description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: external.description })
                .from(external)
                .where(eq(external.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(external)
                .set({ description: value })
                .where(eq(external.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: external.public })
                .from(external)
                .where(eq(external.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(external)
                .set({ public: value })
                .where(eq(external.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `source:${result.id}`,
          initialValue: {
            name: 'source',
            label: 'Source',
            type: 'expression',
            getValue: async () => '(click to edit)',
            description: 'Change external source code',
            onDidClick: async () => {
              extensionContext.views.open({
                key: 'text-editor',
                windowMode: true,
                customData: {
                  resourceId: result.id,
                  resourceType: target.kind,
                  resourceProperty: 'source',
                },
              })
            },
          },
        }),
      ];
    }
  });
}

