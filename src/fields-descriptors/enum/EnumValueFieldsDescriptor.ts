import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { and, eq } from 'drizzle-orm';

import { enumProperty, enumValue, enumValueByProperty } from '../../definition/schema';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createEnumValueFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-value-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'enumValue') return [];

      const [enumeratorValue] = await databaseHelper
        .select({
          id: enumValue.id,
          name: enumValue.name,
          parentEnumId: enumValue.parentEnumId,
        })
        .from(enumValue)
        .where(eq(enumValue.id, target.id))
        .limit(1);

      if (!enumeratorValue) return [];


      const enumProperties = await databaseHelper
        .select({
          id: enumProperty.id,
          name: enumProperty.name,
          dataType: enumProperty.dataType,
          description: enumProperty.description,
        })
        .from(enumProperty)
        .where(eq(enumProperty.parentEnumId, enumeratorValue.parentEnumId))


      return [
        new FieldViewItem({
          key: `type:${enumeratorValue.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum value',
          },
        }),
        new FieldViewItem({
          key: `name:${enumeratorValue.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum value name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: enumValue.name,
                })
                .from(enumValue)
                .where(eq(enumValue.id, enumeratorValue.id))
                .limit(1);

              return item?.name ?? enumeratorValue.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(enumValue)
                .set({
                  name: value
                })
                .where(eq(enumValue.id, enumeratorValue.id));
            },
          },
        }),

        new FieldViewItem({
          key: `separator:${enumeratorValue.id}`,
          initialValue: {
            type: 'view',
            name: 'separator',
            getValue: async () => '',
            label: 'Property values',
          },
        }),

        ...enumProperties.map(property => (
          new FieldViewItem({
            key: `property${property.name}:${property.id}`,
            initialValue: {
              name: 'name',
              label: property.name,
              description: 'Change enum value name',
              type: property.dataType === 'null'
                ? 'view'
                : property.dataType === 'string'
                  ? 'text'
                  : property.dataType === 'number'
                    ? 'number'
                    : 'boolean',
              getValue: async () => {
                const [item] = await databaseHelper
                  .select({
                    value: enumValueByProperty.value,
                  })
                  .from(enumValueByProperty)
                  .where(and(
                    eq(enumValueByProperty.parentEnumValueId, enumeratorValue.id),
                    eq(enumValueByProperty.parentEnumPropertyId, property.id),
                  ))
                  .limit(1)

                return JSON.parse(item?.value as string ?? "null");
              },
              onDidChange: async (value) => {
                await databaseHelper
                  .update(enumValueByProperty)
                  .set({
                    value: value !== null ? JSON.stringify(value) : null,
                  })
                  .where(and(
                    eq(enumValueByProperty.parentEnumValueId, enumeratorValue.id),
                    eq(enumValueByProperty.parentEnumPropertyId, property.id),
                  ))
              },
            },
          })
        ))
      ];
    }
  });
}

