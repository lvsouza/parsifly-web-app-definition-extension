import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { enumProperty } from '../definition/schema';


export const createEnumPropertyDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'enum-property-rules',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumProperty.id,
            name: enumProperty.name,
            type: enumProperty.type,
            dataType: enumProperty.dataType,
            defaultValue: enumProperty.defaultValue,
          })
          .from(enumProperty)
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

      // Check enum property defaultValue to be right dataType
      if (resource.defaultValue !== null && resource.dataType !== typeof resource.defaultValue) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-property-default-value-type-mismatch:${resource.id}`,
            initialValue: {
              ruleId: 'enum-property-default-value-type-mismatch',
              message: `The default value of "${resource.name}" does not match the declared data type`,
              severity: 'error',

              code: 'default-value-type-mismatch',
              category: 'validation',

              target: {
                resourceType: resource.type,
                resourceId: resource.id,
                property: 'defaultValue',
              },

              documentation: {
                summary: 'When a default value is defined, its type must match the property data type.',
              },
            },
          }),
        );
      }

    }
  })
}
