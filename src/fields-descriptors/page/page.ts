import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { page } from '../../definition/schema';


export const createPageFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-page-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'page') return [];

      const [result] = await databaseHelper
        .select({ id: page.id })
        .from(page)
        .where(eq(page.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Page',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change page name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: page.name })
                .from(page)
                .where(eq(page.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(page)
                .set({ name: value })
                .where(eq(page.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change page description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: page.description })
                .from(page)
                .where(eq(page.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(page)
                .set({ description: value })
                .where(eq(page.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change page visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: page.public })
                .from(page)
                .where(eq(page.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(page)
                .set({ public: value })
                .where(eq(page.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

