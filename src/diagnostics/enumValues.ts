import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { eq, or, sql } from 'drizzle-orm';

import { enumProperty, enumValue, enumValueByProperty } from '../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';


export const createEnumValuesDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'enum-value-rules',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumValue.id,
            enumValueName: enumValue.name,
            parentEnumId: enumValue.parentEnumId,
            enumPropertyId: sql`${enumProperty.id} as "enumPropertyId"`,
            enumPropertyName: sql`${enumProperty.name} as "enumPropertyName"`,
            enumPropertyDataType: enumProperty.dataType,
            enumPropertyRequired: enumProperty.required,
            value: enumValueByProperty.value,
          })
          .from(enumValue)
          .innerJoin(enumProperty, eq(enumProperty.parentEnumId, enumValue.parentEnumId))
          .leftJoin(enumValueByProperty, or(
            eq(enumValueByProperty.parentEnumValueId, enumValue.id),
            eq(enumValueByProperty.parentEnumPropertyId, enumProperty.id),
          ))
      )

      const subscription = await extensionContext.data.subscribe({
        query,
        listener: async (data) => listener({ resources: mapResult(data) })
      });

      return async () => {
        await subscription();
      }
    },
    execute: async ({ resource, addDiagnostic }) => {
      if (resource.enumPropertyRequired && (resource.value === null || resource.value === undefined)) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-required-property-empty:${resource.id}:${resource.enumPropertyId}`,
            initialValue: {
              ruleId: 'enum-required-property-not-filled',
              message: `The required property "${resource.enumPropertyName}" is not defined for enum value "${resource.enumValueName}"`,
              severity: 'error',

              code: 'required-property-empty',
              category: 'validation',

              target: {
                resourceType: 'enumProperty',
                resourceId: resource.id,
                property: 'required',
              },

              documentation: {
                summary: 'All required enum properties must have a value defined for every enum value.',
              },
            },
          }),
        );
      } else if (typeof resource.value !== resource.enumPropertyDataType) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-value-by-property-wrong-data-type:${resource.id}:${resource.enumPropertyId}`,
            initialValue: {
              ruleId: 'enum-property-invalid-data-type',
              message: `The value of property "${resource.enumPropertyName}" for enum value "${resource.enumValueName}" does not match the expected data type.`,
              severity: 'error',

              code: 'invalid-property-data-type',
              category: 'validation',

              target: {
                resourceType: 'enumProperty',
                resourceId: resource.id,
                property: 'dataType',
              },

              documentation: {
                summary: `Enum property values must match the data type defined by the property. Expected data type "${resource.enumPropertyDataType}" but received data type "${typeof resource.value}"`,
              },
            },
          }),
        );
      }
    },
  });
}
