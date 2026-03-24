import { CompletionViewItem, FieldsDescriptor, FieldViewItem, TExtensionContext, TFieldViewItemType, TFieldViewItemValue } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { actionParameter, property, TWebAppDataType } from '../../definition/schema';


export const createProjectActionParameterFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-projectActionParameter-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'projectActionParameter') return [];

      const [result] = await databaseHelper
        .select({ id: property.id, actionParameterId: sql<string | undefined>`${actionParameter.id}`.as('actionParameterId') })
        .from(property)
        .leftJoin(actionParameter, eq(actionParameter.propertyId, property.id))
        .where(eq(property.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Action parameter',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change parameter name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: property.name })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ name: value })
                .where(eq(property.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change parameter description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: property.description })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ description: value })
                .where(eq(property.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `required:${result.id}`,
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Required',
            description: 'Change parameter required',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  required: property.required,
                })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item?.required ?? false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(property)
                .set({ required: value })
                .where(eq(property.id, result.id))
            },
          },
        }),
        new FieldViewItem({
          key: `dataType:${result.id}`,
          initialValue: {
            name: 'dataType',
            label: 'Data type',
            type: 'autocomplete',
            description: 'Change parameter data type',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];
              const [{ dataType: dataTypeValue, structureReferenceId: structureReferenceIdValue, enumReferenceId: enumReferenceIdValue }] = await databaseHelper
                .select({
                  dataType: property.dataType,
                  enumReferenceId: property.enumReferenceId,
                  structureReferenceId: property.structureReferenceId,
                })
                .from(property)
                .where(eq(property.id, result.id))
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
                    .where(eq(property.parentPropertyId, result.id));

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
                    .where(eq(property.parentPropertyId, result.id));

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
                      .where(eq(property.id, result.id))
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.id));
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
                      .where(eq(property.id, result.id));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.id))
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
                    .where(eq(property.id, result.id));
                });
              } else if (value === 'array') {
                const arrayTypesCompletions = await extensionContext.completions.get({
                  kind: 'type_of_array',
                  visibility: {
                    type: 'projectActionParameter',
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
                      .where(eq(property.id, result.id));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.id));
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
                      .where(eq(property.id, result.id));
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.id));
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
                      .where(eq(property.id, result.id));
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
                      .where(eq(property.id, result.id));;
                    await trx
                      .delete(property)
                      .where(eq(property.parentPropertyId, result.id));
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
                    .where(eq(property.id, result.id))
                    ;
                  await trx
                    .delete(property)
                    .where(eq(property.parentPropertyId, result.id));
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'type',
                visibility: {
                  type: 'projectActionParameter',
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
            description: 'Change default value',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  defaultValue: property.defaultValue,
                })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return JSON.parse(item?.defaultValue as string ?? 'null');
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (value === null || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper
                .update(property)
                .set({
                  defaultValue: value ? JSON.stringify(value) : null
                })
                .where(eq(property.id, result.id));
            },
          },
          onDidMount: async (context) => {
            const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
              switch (dataType) {
                case 'string': return 'text'
                case 'number': return 'number'
                case 'boolean': return 'boolean'
                default: return null;
              }
            }

            let [item] = await databaseHelper
              .select({ dataType: property.dataType })
              .from(property)
              .where(eq(property.id, result.id))
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
                .where(eq(property.id, result.id))
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
        new FieldViewItem({
          key: `json-name:${result.id}`,
          initialValue: {
            type: 'text',
            name: 'jsonName',
            label: 'Json name',
            description: 'Change json name. Used to map this to the source code.',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ jsonName: property.jsonName })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item.jsonName || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ jsonName: value })
                .where(eq(property.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

