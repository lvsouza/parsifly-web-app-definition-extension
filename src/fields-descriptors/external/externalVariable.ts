import { CompletionViewItem, FieldsDescriptor, FieldViewItem, TExtensionContext, TFieldViewItemType, TFieldViewItemValue } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { externalVariable, property, TWebAppDataType } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {

  console.log('dataType', dataType)

  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createExternalVariableFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalVariable-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalVariable') return [];

      const [result] = await databaseHelper
        .select({ id: externalVariable.id, propertyId: externalVariable.propertyId })
        .from(externalVariable)
        .where(eq(externalVariable.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External variable',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external variable name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: property.name })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ name: value })
                .where(eq(property.id, result.propertyId));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change external variable description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: property.description })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ description: value })
                .where(eq(property.id, result.propertyId));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external variable visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: externalVariable.public })
                .from(externalVariable)
                .where(eq(externalVariable.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(externalVariable)
                .set({ public: value })
                .where(eq(externalVariable.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${result.id}`,
          initialValue: {
            name: 'dataType',
            type: 'autocomplete',
            label: 'Data type',
            description: 'Change external variable data type',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];
              const [{ dataType: dataTypeValue, structureReferenceId: structureReferenceIdValue, enumReferenceId: enumReferenceIdValue }] = await databaseHelper
                .select({
                  dataType: property.dataType,
                  enumReferenceId: property.enumReferenceId,
                  structureReferenceId: property.structureReferenceId,
                })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

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
                  const properties = await databaseHelper
                    .select({ name: property.name })
                    .from(property)
                    .where(eq(property.parentPropertyId, result.propertyId));

                  return new CompletionViewItem({
                    key: 'object',
                    initialValue: {
                      value: 'object',
                      icon: { path: 'object.svg' },
                      label: `Object of ${properties.map(property => property.name).join(',')}`,
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
                  const properties = await databaseHelper
                    .select({ name: property.name })
                    .from(property)
                    .where(eq(property.parentPropertyId, result.propertyId));

                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      value: 'array_object',
                      icon: { path: 'array.svg' },
                      label: `Array of ${properties.map(property => property.name.replace('array_', '')).join(',')}`,
                    },
                  }).serialize();
                }
                case 'array_enum': {
                  const completion = completions.find((completion: any) => typeof completion.value === 'object' && 'type' in completion.value && completion.value.type === 'enum' && completion.value.referenceId === enumReferenceIdValue);
                  if (!completion) return null;

                  return new CompletionViewItem({
                    key: 'array',
                    initialValue: {
                      icon: { path: 'array.svg' },
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
                      icon: { path: 'array.svg' },
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
                      icon: { path: 'array.svg' },
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
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        structureReferenceId: value.referenceId as string,
                        dataType: value.type as 'structure',
                        enumReferenceId: null,
                        defaultValue: null,
                      })
                      .where(eq(property.id, result.propertyId))
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.propertyId));
                  });
                } else if ('type' in value && value.type === 'enum' && 'referenceId' in value && typeof value.referenceId === 'string') {
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        enumReferenceId: value.referenceId as string,
                        dataType: value.type as 'enum',
                        structureReferenceId: null,
                        defaultValue: null,
                      })
                      .where(eq(property.id, result.propertyId));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.propertyId))
                      ;
                  });
                }
              } else if (value === 'object') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(property)
                    .set({
                      dataType: 'object',
                      defaultValue: null,
                      structureReferenceId: null,
                    })
                    .where(eq(property.id, result.propertyId));
                });
              } else if (value === 'array') {
                const arrayTypesCompletions = await extensionContext.completions.get({
                  kind: 'type_of_array',
                  visibility: {
                    type: 'structure_property',
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
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        structureReferenceId: arrayType.referenceId,
                        dataType: 'array_structure',
                        enumReferenceId: null,
                        defaultValue: null,
                      })
                      .where(eq(property.id, result.propertyId));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.propertyId));
                  });
                } else if (arrayType && typeof arrayType === 'object' && 'type' in arrayType && arrayType.type === 'enum') {
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        enumReferenceId: arrayType.referenceId,
                        structureReferenceId: null,
                        dataType: 'array_enum',
                        defaultValue: null,
                      })
                      .where(eq(property.id, result.propertyId));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.propertyId));
                  });
                } else if (arrayType === 'object') {
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        dataType: 'array_object',
                        defaultValue: null,
                        structureReferenceId: null,
                      })
                      .where(eq(property.id, result.propertyId));
                  });
                } else {
                  await databaseHelper.transaction(async trx => {
                    await trx
                      .update(property)
                      .set({
                        dataType: `array_${arrayType}` as 'array_string',
                        defaultValue: null,
                        structureReferenceId: null,
                      })
                      .where(eq(property.id, result.propertyId));;
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.propertyId));
                  });
                }
              } else {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(property)
                    .set({
                      dataType: value,
                      defaultValue: null,
                      structureReferenceId: null,
                    })
                    .where(eq(property.id, result.propertyId))
                    ;
                  await trx
                    .delete(property)
                    .where(eq(property.parentPropertyId, result.propertyId));
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'type',
                visibility: {
                  type: 'variable_property',
                }
              });

              return result;
            },
          },
        }),
        new FieldViewItem({
          key: `defaultValue:${result.propertyId}`,
          initialValue: {
            name: 'defaultValue',
            type: 'text',
            label: 'Default value',
            description: 'Change external variable default value',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ defaultValue: property.defaultValue })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

              return JSON.parse(item?.defaultValue as string ?? 'null');
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (value === null || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper
                .update(property)
                .set({ defaultValue: value ? JSON.stringify(value) : null })
                .where(eq(property.id, result.propertyId));
            },
          },
          onDidMount: async (context) => {
            let [item] = await databaseHelper
              .select({ dataType: property.dataType })
              .from(property)
              .where(eq(property.id, result.propertyId))
              .limit(1);

            const fieldType = getFieldTypeByDataType(item.dataType);
            if (fieldType) {
              await context.set('type', fieldType);
              await context.set('disabled', false);
            } else {
              await context.set('disabled', true);
              await context.set('type', 'text');
            }

            const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
              databaseHelper
                .select({
                  id: property.id,
                  dataType: property.dataType,
                })
                .from(property)
                .where(eq(property.id, result.propertyId))
            );
            const detailsSub = await extensionContext.data.subscribe({
              query: itemDetailQuery,
              listener: async (data) => {
                const [updatedItem] = itemDetailMapResult(data);
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

