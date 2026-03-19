import { FieldsDescriptor, FieldViewItem, TExtensionContext, TFieldViewItemType } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { enumProperty, TWebAppBasicDataType, TWebAppDataType } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createEnumPropertyFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-property-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'enumProperty') return [];

      const [result] = await databaseHelper
        .select({
          id: enumProperty.id,
          name: enumProperty.name,
          description: enumProperty.description,
          dataType: enumProperty.dataType,
          required: enumProperty.required,
          defaultValue: enumProperty.defaultValue,
        })
        .from(enumProperty)
        .where(eq(enumProperty.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum property',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum property name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: enumProperty.name,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1)

              return item?.name ?? result.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(enumProperty)
                .set({
                  name: value
                })
                .where(eq(enumProperty.id, result.id))
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change enum property description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  description: enumProperty.description,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1)

              return item?.description ?? result.description;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(enumProperty)
                .set({
                  description: value
                })
                .where(eq(enumProperty.id, result.id))
            },
          }
        }),
        new FieldViewItem({
          key: `required:${result.id}`,
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Required',
            description: 'Change enum property required',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  required: enumProperty.required,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1)

              return item?.required ?? result.required;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(enumProperty)
                .set({
                  required: value
                })
                .where(eq(enumProperty.id, result.id))
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${result.id}`,
          initialValue: {
            name: 'dataType',
            type: 'autocomplete',
            label: 'Data type',
            description: 'Change enum property data type',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];
              const [{ dataType: dataTypeValue }] = await databaseHelper
                .select({
                  dataType: enumProperty.dataType,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1);

              switch (dataTypeValue) {
                case 'null':
                case 'string':
                case 'number':
                case 'boolean':
                default: {
                  const completion = completions.find(completion => completion.value === dataTypeValue);
                  return completion ?? null;
                }
              }
            },
            onDidChange: async (value: TWebAppBasicDataType, context) => {
              await databaseHelper
                .update(enumProperty)
                .set({
                  dataType: value,
                  defaultValue: null,
                })
                .where(eq(enumProperty.id, result.id));

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'type',
                visibility: {
                  type: 'enumProperty',
                }
              });

              return result;
            },
          },
        }),
        new FieldViewItem({
          key: `defaultValue:${result.id}`,
          initialValue: {
            name: 'defaultValue',
            type: 'text',
            label: 'Default value',
            description: 'Change enum property default value',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  defaultValue: enumProperty.defaultValue,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1);

              return JSON.parse(item?.defaultValue as string ?? 'null');
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (value === null || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper
                .update(enumProperty)
                .set({
                  defaultValue: value ? JSON.stringify(value) : null,
                })
                .where(eq(enumProperty.id, result.id))
            },
          },
          onDidMount: async (context) => {
            let [item] = await databaseHelper
              .select({
                dataType: enumProperty.dataType,
              })
              .from(enumProperty)
              .where(eq(enumProperty.id, result.id))
              .limit(1);

            const fieldType = getFieldTypeByDataType(item.dataType);
            if (fieldType) {
              await context.set('type', fieldType);
              await context.set('disabled', false);
            } else {
              await context.set('disabled', true);
              await context.set('type', 'text');
            }


            const [itemDetailQuery, itemsDetailMapResult] = mappableQuery(
              databaseHelper
                .select({
                  id: enumProperty.id,
                  dataType: enumProperty.dataType,
                })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
            );
            const detailsSub = await extensionContext.data.subscribe({
              query: itemDetailQuery,
              listener: async (data) => {
                const [updatedItem] = itemsDetailMapResult(data);
                const fieldType = getFieldTypeByDataType(updatedItem.dataType);
                if (fieldType) {
                  await context.set('type', fieldType);
                  await context.set('disabled', false);
                } else {
                  await context.set('disabled', true);
                  await context.set('type', 'text');
                }

                if (item.dataType !== updatedItem.dataType) {
                  await context.reloadValue();
                }
              },
            });

            return async () => {
              await detailsSub();
            };
          },
        }),
        new FieldViewItem({
          key: `json-name:${result.id}`,
          initialValue: {
            type: 'text',
            name: 'jsonName',
            label: 'Json name',
            description: 'Change json name. Used to map this to the source code.',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ jsonName: enumProperty.jsonName })
                .from(enumProperty)
                .where(eq(enumProperty.id, result.id))
                .limit(1);

              return item.jsonName || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(enumProperty)
                .set({ jsonName: value })
                .where(eq(enumProperty.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

