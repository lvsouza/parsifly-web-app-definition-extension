import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { count, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { structure, structureProperty } from '../definition/schema';


export const createStructureDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'structure-rules',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: structure.id,
            name: structure.name,
            type: structure.type,
            structurePropertyCount: count(structureProperty.id),
          })
          .from(structure)
          .leftJoin(structureProperty, eq(structureProperty.structureId, structure.id))
          .groupBy(structure.id, structure.name, structure.type)
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
      if (resource.structurePropertyCount > 0) {
        return;
      }

      addDiagnostic(
        new DiagnosticViewItem({
          key: `structure-without-properties:${resource.id}`,
          initialValue: {
            ruleId: 'structure-must-have-properties',
            message: `The structure "${resource.name}" must define at least one property`,
            severity: 'error',

            code: 'enum-without-properties',
            category: 'validation',

            target: {
              resourceType: resource.type,
              resourceId: resource.id,
            },

            documentation: {
              summary: 'Enums must define at least one property so their values can carry structured data.',
            },
          },
        }),
      );
    },
  });
}
