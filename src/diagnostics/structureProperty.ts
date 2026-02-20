import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { property, structureProperty } from '../definition/schema';


export const createStructurePropertyDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'structure-property-rules',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: structureProperty.id,
            type: structureProperty.type,
            name: property.name,
            dataType: property.dataType,
            defaultValue: property.defaultValue,
          })
          .from(structureProperty)
          .innerJoin(property, eq(property.id, structureProperty.propertyId))
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

      // Check structure property defaultValue to be right dataType
      if (resource.defaultValue !== null && resource.dataType !== typeof resource.defaultValue) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `structure-property-default-value-type-mismatch:${resource.id}`,
            initialValue: {
              ruleId: 'structure-property-default-value-type-mismatch',
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
