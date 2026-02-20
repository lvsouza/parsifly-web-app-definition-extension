import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { count, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { enumProperty, enumTable } from '../definition/schema';


export const createEnumDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  databaseHelper
    .select({
      id: enumTable.id,
      type: enumTable.type,
      name: enumTable.name,
      enumPropertyCount: count(enumProperty.id),
    })
    .from(enumTable)
    .leftJoin(enumProperty, eq(enumProperty.parentEnumId, enumTable.id))
    .groupBy(enumTable.id, enumTable.name, enumTable.type)


  return new DiagnosticAnalyzer({
    key: 'enum-rules',
    mode: 'perResource',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumTable.id,
            name: enumTable.name,
            type: enumTable.type,
            enumPropertyCount: count(enumProperty.id),
          })
          .from(enumTable)
          .leftJoin(enumProperty, eq(enumProperty.parentEnumId, enumTable.id))
          .groupBy(enumTable.id, enumTable.name, enumTable.type)
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
      if (resource.enumPropertyCount > 0) {
        return;
      }

      addDiagnostic(
        new DiagnosticViewItem({
          key: `enum-without-properties:${resource.id}`,
          initialValue: {
            ruleId: 'enum-must-have-properties',
            message: `The enum "${resource.name}" must define at least one property`,
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
