import { CompletionViewItem, FieldsDescriptor, FieldViewItem, TApplication, TFieldViewItemType, TFieldViewItemValue } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { TWebAppDataType } from '../definition/DatabaseTypes';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createStructureAttributeFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new FieldsDescriptor({
    key: 'web-app-structure-attribute-fields-descriptor',
    onGetFields: async (key) => {
      const structure = await databaseHelper
        .selectFrom('structureAttribute')
        .select(['name', 'description', 'dataType', 'required', 'defaultValue'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!structure) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Structure attribute',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure attribute name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure attribute description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `required:${key}`,
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Required',
            description: 'Change structure attribute required',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('required').executeTakeFirst()
              return item?.required || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('required', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${key}`,
          initialValue: {
            name: 'dataType',
            type: 'autocomplete',
            label: 'Data type',
            description: 'Change structure attribute data type',
            getValue: async (context) => {
              const completions = await context.getCompletions();
              const { dataType: dataTypeValue, referenceId: referenceIdValue } = await databaseHelper
                .selectFrom('structureAttribute')
                .select(['dataType', 'referenceId'])
                .where('id', '=', key)
                .executeTakeFirstOrThrow();

              switch (dataTypeValue) {
                case 'null':
                case 'string':
                case 'number':
                case 'boolean':
                case 'binary': {
                  const completion = completions.find(completion => completion.value === dataTypeValue);
                  return completion || null;
                }
                case 'object': {
                  const attributes = await databaseHelper.selectFrom('structureAttribute').select('dataType').where('parentStructureAttributeId', '=', key).execute();
                  return new CompletionViewItem({
                    key: 'object',
                    initialValue: {
                      value: 'object',
                      icon: { type: 'object' },
                      label: `Object of ${attributes.map(attribute => attribute.dataType).join(',')}`,
                    },
                  }).serialize();
                }
                case 'structure': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'structure' && completion.value.referenceId === referenceIdValue);
                  return completion || null;
                }
                case 'array_object': {
                  const attributes = await databaseHelper.selectFrom('structureAttribute').select('dataType').where('parentStructureAttributeId', '=', key).execute();
                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      value: 'array_object',
                      icon: { type: 'array' },
                      label: `Array of ${attributes.map(attribute => attribute.dataType.replace('array_', '')).join(',')}`,
                    },
                  }).serialize();
                }
                case 'array_structure': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'structure' && completion.value.referenceId === referenceIdValue);
                  if (!completion) return null;

                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      icon: { type: 'array' },
                      label: `Array of ${completion.label}`,
                      value: { type: 'array_structure', referenceId: referenceIdValue },
                    },
                  }).serialize();
                }

                default: {
                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      value: dataTypeValue,
                      icon: { type: 'array' },
                      label: `Array of ${dataTypeValue.replace('array_', '')}`,
                    },
                  }).serialize();
                }
              }
            },
            onDidChange: async (value: TWebAppDataType | 'array' | { type: string, referenceId: string }, context) => {
              if (value && typeof value === 'object') {
                // Garante que é uma structure e tem o id de referência dela
                if ('type' in value && value.type === 'structure' && 'referenceId' in value && typeof value.referenceId === 'string') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', key)
                      .set('referenceId', value.referenceId as string)
                      .set('dataType', value.type as 'structure')
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', key)
                      .execute();
                  });
                }
              } else if (value === 'object') {
                await databaseHelper.transaction().execute(async trx => {
                  await trx
                    .updateTable('structureAttribute')
                    .where('id', '=', key)
                    .set('dataType', 'object')
                    .set('defaultValue', null)
                    .set('referenceId', null)
                    .execute();
                });
              } else if (value === 'array') {
                const arrayTypesCompletions = await application.completions.get({
                  kind: 'type_of_array',
                  visibility: {
                    type: 'structure_attribute',
                  },
                })

                const arrayType = await application.quickPick.show<TFieldViewItemValue | { type: string, referenceId: string }>({
                  modal: true,
                  selectOnly: true,
                  title: 'Select the array type',
                  options: arrayTypesCompletions,
                  helpText: 'Select one of this options',
                });
                if (!arrayType) return;

                if (arrayType && typeof arrayType === 'object' && 'type' in arrayType && arrayType.type === 'structure') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', key)
                      .set('referenceId', arrayType.referenceId)
                      .set('dataType', 'array_structure')
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', key)
                      .execute();
                  });
                } else if (arrayType === 'object') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', key)
                      .set('dataType', 'array_object')
                      .set('defaultValue', null)
                      .set('referenceId', null)
                      .execute();
                  });
                } else {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', key)
                      .set('dataType', `array_${arrayType}` as 'array_string')
                      .set('defaultValue', null)
                      .set('referenceId', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', key)
                      .execute();
                  });
                }
              } else {
                await databaseHelper.transaction().execute(async trx => {
                  await trx
                    .updateTable('structureAttribute')
                    .where('id', '=', key)
                    .set('dataType', value)
                    .set('defaultValue', null)
                    .set('referenceId', null)
                    .execute();
                  await trx
                    .deleteFrom('structureAttribute')
                    .where('parentStructureAttributeId', '=', key)
                    .execute();
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await application.completions.get({
                kind: 'type',
                visibility: {
                  type: 'structure_attribute',
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
            description: 'Change structure attribute default value',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('defaultValue').executeTakeFirst()
              return item?.defaultValue || false;
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (!value || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('defaultValue', value ? JSON.stringify(value) : null).execute();
            },
          },
          onDidMount: async (context) => {
            let item = await databaseHelper
              .selectFrom('structureAttribute')
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

            const detailsSub = await application.data.subscribe({
              query: (
                databaseHelper
                  .selectFrom('structureAttribute')
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

            context.onDidUnmount(async () => {
              await detailsSub();
            });
          },
        }),
      ];
    }
  });
}

