import { CompletionViewItem, FieldsDescriptor, FieldViewItem, TExtensionContext, TFieldViewItemType, TFieldViewItemValue } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { TWebAppDataType } from '../../definition/DatabaseTypes';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createStructureAttributeFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-structure-attribute-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'structureAttribute') return [];

      const structure = await databaseHelper
        .selectFrom('structureAttribute')
        .select(['id', 'name', 'description', 'dataType', 'required', 'defaultValue'])
        .where('id', '=', target.id)
        .executeTakeFirst();


      if (!structure) return [];

      return [
        new FieldViewItem({
          key: `type:${structure.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Structure attribute',
          },
        }),
        new FieldViewItem({
          key: `name:${structure.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure attribute name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', structure.id).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', structure.id).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${structure.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure attribute description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', structure.id).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', structure.id).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `required:${structure.id}`,
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Required',
            description: 'Change structure attribute required',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', structure.id).select('required').executeTakeFirst()
              return item?.required || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', structure.id).set('required', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${structure.id}`,
          initialValue: {
            name: 'dataType',
            type: 'autocomplete',
            label: 'Data type',
            description: 'Change structure attribute data type',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];
              const { dataType: dataTypeValue, structureReferenceId: structureReferenceIdValue, enumReferenceId: enumReferenceIdValue } = await databaseHelper
                .selectFrom('structureAttribute')
                .select(['dataType', 'structureReferenceId', 'enumReferenceId'])
                .where('id', '=', structure.id)
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
                  const attributes = await databaseHelper.selectFrom('structureAttribute').select('dataType').where('parentStructureAttributeId', '=', structure.id).execute();
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
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'structure' && completion.value.referenceId === structureReferenceIdValue);
                  return completion || null;
                }
                case 'enum': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'enum' && completion.value.referenceId === enumReferenceIdValue);
                  return completion || null;
                }
                case 'array_object': {
                  const attributes = await databaseHelper.selectFrom('structureAttribute').select('dataType').where('parentStructureAttributeId', '=', structure.id).execute();
                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      value: 'array_object',
                      icon: { type: 'array' },
                      label: `Array of ${attributes.map(attribute => attribute.dataType.replace('array_', '')).join(',')}`,
                    },
                  }).serialize();
                }
                case 'array_enum': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'enum' && completion.value.referenceId === enumReferenceIdValue);
                  if (!completion) return null;

                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      icon: { type: 'array' },
                      label: `Array of ${completion.label}`,
                      value: { type: 'array_enum', referenceId: enumReferenceIdValue },
                    },
                  }).serialize();
                }
                case 'array_structure': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'structure' && completion.value.referenceId === structureReferenceIdValue);
                  if (!completion) return null;

                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      icon: { type: 'array' },
                      label: `Array of ${completion.label}`,
                      value: { type: 'array_structure', referenceId: structureReferenceIdValue },
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
                      .where('id', '=', structure.id)
                      .set('structureReferenceId', value.referenceId as string)
                      .set('dataType', value.type as 'structure')
                      .set('enumReferenceId', null)
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', structure.id)
                      .execute();
                  });
                } else if ('type' in value && value.type === 'enum' && 'referenceId' in value && typeof value.referenceId === 'string') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', structure.id)
                      .set('enumReferenceId', value.referenceId as string)
                      .set('dataType', value.type as 'enum')
                      .set('structureReferenceId', null)
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', structure.id)
                      .execute();
                  });
                }
              } else if (value === 'object') {
                await databaseHelper.transaction().execute(async trx => {
                  await trx
                    .updateTable('structureAttribute')
                    .where('id', '=', structure.id)
                    .set('dataType', 'object')
                    .set('defaultValue', null)
                    .set('structureReferenceId', null)
                    .execute();
                });
              } else if (value === 'array') {
                const arrayTypesCompletions = await extensionContext.completions.get({
                  kind: 'type_of_array',
                  visibility: {
                    type: 'structure_attribute',
                  },
                })

                const arrayType = await extensionContext.quickPick.show<TFieldViewItemValue | { type: string, referenceId: string }>({
                  modal: true,
                  selectOnly: true,
                  title: 'Select the array type',
                  options: arrayTypesCompletions,
                  helpText: 'Select one of this options',
                });
                if (!arrayType) {
                  await context.reloadValue();
                  return;
                }

                if (arrayType && typeof arrayType === 'object' && 'type' in arrayType && arrayType.type === 'structure') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', structure.id)
                      .set('structureReferenceId', arrayType.referenceId)
                      .set('dataType', 'array_structure')
                      .set('enumReferenceId', null)
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', structure.id)
                      .execute();
                  });
                } else if (arrayType && typeof arrayType === 'object' && 'type' in arrayType && arrayType.type === 'enum') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', structure.id)
                      .set('enumReferenceId', arrayType.referenceId)
                      .set('structureReferenceId', null)
                      .set('dataType', 'array_enum')
                      .set('defaultValue', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', structure.id)
                      .execute();
                  });
                } else if (arrayType === 'object') {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', structure.id)
                      .set('dataType', 'array_object')
                      .set('defaultValue', null)
                      .set('structureReferenceId', null)
                      .execute();
                  });
                } else {
                  await databaseHelper.transaction().execute(async trx => {
                    await trx
                      .updateTable('structureAttribute')
                      .where('id', '=', structure.id)
                      .set('dataType', `array_${arrayType}` as 'array_string')
                      .set('defaultValue', null)
                      .set('structureReferenceId', null)
                      .execute();
                    await trx
                      .deleteFrom('structureAttribute')
                      .where('parentStructureAttributeId', '=', structure.id)
                      .execute();
                  });
                }
              } else {
                await databaseHelper.transaction().execute(async trx => {
                  await trx
                    .updateTable('structureAttribute')
                    .where('id', '=', structure.id)
                    .set('dataType', value)
                    .set('defaultValue', null)
                    .set('structureReferenceId', null)
                    .execute();
                  await trx
                    .deleteFrom('structureAttribute')
                    .where('parentStructureAttributeId', '=', structure.id)
                    .execute();
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
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
          key: `defaultValue:${structure.id}`,
          initialValue: {
            name: 'defaultValue',
            type: 'text',
            label: 'Default value',
            description: 'Change structure attribute default value',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', structure.id).select('defaultValue').executeTakeFirst()
              return item?.defaultValue || false;
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (!value || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', structure.id).set('defaultValue', value ? JSON.stringify(value) : null).execute();
            },
          },
          onDidMount: async (context) => {
            let item = await databaseHelper
              .selectFrom('structureAttribute')
              .where('id', '=', structure.id)
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
                  .selectFrom('structureAttribute')
                  .select(['id', 'dataType'])
                  .where('id', '=', structure.id)
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

