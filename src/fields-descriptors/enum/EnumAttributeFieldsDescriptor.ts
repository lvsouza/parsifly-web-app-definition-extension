import { FieldsDescriptor, FieldViewItem, TExtensionContext, TFieldViewItemType } from 'parsifly-extension-base';

import { TWebAppBasicDataType, TWebAppDataType } from '../../definition/DatabaseTypes';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createEnumAttributeFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-attribute-fields-descriptor',
    onGetFields: async (key) => {
      const enumAttribute = await databaseHelper
        .selectFrom('enumAttribute')
        .select(['name', 'description', 'dataType', 'required', 'defaultValue'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!enumAttribute) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum attribute',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum attribute name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumAttribute').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || enumAttribute.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enumAttribute').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change enum attribute description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumAttribute').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || enumAttribute.description;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enumAttribute').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `required:${key}`,
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Required',
            description: 'Change enum attribute required',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumAttribute').where('id', '=', key).select('required').executeTakeFirst()
              return item?.required || enumAttribute.required;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('enumAttribute').where('id', '=', key).set('required', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${key}`,
          initialValue: {
            name: 'dataType',
            type: 'autocomplete',
            label: 'Data type',
            description: 'Change enum attribute data type',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];
              const { dataType: dataTypeValue } = await databaseHelper
                .selectFrom('enumAttribute')
                .select(['dataType'])
                .where('id', '=', key)
                .executeTakeFirstOrThrow();

              switch (dataTypeValue) {
                case 'null':
                case 'string':
                case 'number':
                case 'boolean':
                default: {
                  const completion = completions.find(completion => completion.value === dataTypeValue);
                  return completion || null;
                }
              }
            },
            onDidChange: async (value: TWebAppBasicDataType, context) => {
              await databaseHelper
                .updateTable('enumAttribute')
                .where('id', '=', key)
                .set('dataType', value)
                .set('defaultValue', null)
                .execute();

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'type',
                visibility: {
                  type: 'enum_attribute',
                }
              });

              return result;
            },
          },
        }),
        new FieldViewItem({
          key: `defaultValue:${key}`,
          initialValue: {
            name: 'defaultValue',
            type: 'text',
            label: 'Default value',
            description: 'Change enum attribute default value',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumAttribute').where('id', '=', key).select('defaultValue').executeTakeFirst()
              return item?.defaultValue || enumAttribute.defaultValue;
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (!value || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper.updateTable('enumAttribute').where('id', '=', key).set('defaultValue', value ? JSON.stringify(value) : null).execute();
            },
          },
          onDidMount: async (context) => {
            let item = await databaseHelper
              .selectFrom('enumAttribute')
              .where('id', '=', key)
              .select(['dataType'])
              .executeTakeFirstOrThrow();

            const fieldType = getFieldTypeByDataType(item.dataType);
            if (fieldType) {
              await context.set('type', fieldType);
              await context.set('disabled', false);
            } else {
              await context.set('disabled', true);
              await context.set('type', 'text');
            }

            const detailsSub = await extensionContext.data.subscribe({
              query: (
                databaseHelper
                  .selectFrom('enumAttribute')
                  .select(['id', 'dataType'])
                  .where('id', '=', key)
                  .compile()
              ),
              listener: async ({ rows: [updatedItem] }) => {
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
      ];
    }
  });
}

