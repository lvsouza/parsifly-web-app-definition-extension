import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createEnumValuesDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'enum-value-rules',
    query: (
      databaseHelper
        .selectFrom('enumValue')
        .innerJoin('enumAttribute', 'enumAttribute.parentEnumId', 'enumValue.parentEnumId')
        .leftJoin('enumValueByAttribute', (join) => (
          join
            .onRef('enumValueByAttribute.parentEnumValueId', '=', 'enumValue.id')
            .onRef('enumValueByAttribute.parentEnumAttributeId', '=', 'enumAttribute.id')
        ))
        .select([
          'enumValue.id as id',
          'enumValue.parentEnumId',
          'enumValue.name as enumValueName',

          'enumAttribute.id as enumAttributeId',
          'enumAttribute.name as enumAttributeName',
          'enumAttribute.dataType as enumAttributeDataType',
          'enumAttribute.required as enumAttributeRequired',

          'enumValueByAttribute.value',
        ])
        .compile()
    ),
    execute: async ({ resource, addDiagnostic }) => {
      if (resource.enumAttributeRequired && (resource.value === null || resource.value === undefined)) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-required-attribute-empty:${resource.id}:${resource.enumAttributeId}`,
            initialValue: {
              ruleId: 'enum-required-attribute-not-filled',
              message: `The required attribute "${resource.enumAttributeName}" is not defined for enum value "${resource.enumValueName}"`,
              severity: 'error',

              code: 'required-attribute-empty',
              category: 'validation',

              target: {
                resourceType: 'enumAttribute',
                resourceId: resource.id,
                property: 'required',
              },

              documentation: {
                summary: 'All required enum attributes must have a value defined for every enum value.',
              },
            },
          }),
        );
      } else if (typeof resource.value !== resource.enumAttributeDataType) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-value-by-attribute-wrong-data-type:${resource.id}:${resource.enumAttributeId}`,
            initialValue: {
              ruleId: 'enum-attribute-invalid-data-type',
              message: `The value of attribute "${resource.enumAttributeName}" for enum value "${resource.enumValueName}" does not match the expected data type.`,
              severity: 'error',

              code: 'invalid-attribute-data-type',
              category: 'validation',

              target: {
                resourceType: 'enumAttribute',
                resourceId: resource.id,
                property: 'dataType',
              },

              documentation: {
                summary: `Enum attribute values must match the data type defined by the attribute. Expected data type "${resource.enumAttributeDataType}" but received data type "${typeof resource.value}"`,
              },
            },
          }),
        );
      }
    },
  });
}
