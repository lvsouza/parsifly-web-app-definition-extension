import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { enumTable } from '../../definition/schema';


export const createEnumFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'enum') return [];

      const [enumerator] = await databaseHelper
        .select({
          id: enumTable.id,
          name: enumTable.name,
          public: enumTable.public,
          description: enumTable.description,
        })
        .from(enumTable)
        .where(eq(enumTable.id, target.id))
        .limit(1);

      if (!enumerator) return [];


      return [
        new FieldViewItem({
          key: `type:${enumerator.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum',
          },
        }),
        new FieldViewItem({
          key: `name:${enumerator.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: enumTable.name,
                })
                .from(enumTable)
                .where(eq(enumTable.id, enumerator.id))
                .limit(1)

              return item?.name || enumerator.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(enumTable)
                .set({
                  name: value
                })
                .where(eq(enumTable.id, enumerator.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${enumerator.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change enum description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  description: enumTable.description,
                })
                .from(enumTable)
                .where(eq(enumTable.id, enumerator.id))
                .limit(1)

              return item?.description || enumerator.description;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(enumTable)
                .set({
                  description: value
                })
                .where(eq(enumTable.id, enumerator.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${enumerator.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change enum visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  public: enumTable.public,
                })
                .from(enumTable)
                .where(eq(enumTable.id, enumerator.id))
                .limit(1);

              return item?.public || enumerator.public;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(enumTable)
                .set({
                  public: value
                })
                .where(eq(enumTable.id, enumerator.id));
            },
          },
        }),
      ];
    }
  });
}

