import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { structure } from '../../definition/schema';


export const createStructureFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-structure-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'structure') return [];

      const [result] = await databaseHelper
        .select({
          id: structure.id,
          name: structure.name,
          description: structure.description,
        })
        .from(structure)
        .where(eq(structure.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Structure',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: structure.name,
                })
                .from(structure)
                .where(eq(structure.id, result.id))
                .limit(1);

              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(structure)
                .set({ name: value })
                .where(eq(structure.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  description: structure.description,
                })
                .from(structure)
                .where(eq(structure.id, result.id))
                .limit(1);

              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(structure)
                .set({ description: value })
                .where(eq(structure.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change structure visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  public: structure.public,
                })
                .from(structure)
                .where(eq(structure.id, result.id))
                .limit(1);

              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(structure)
                .set({ public: value })
                .where(eq(structure.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

