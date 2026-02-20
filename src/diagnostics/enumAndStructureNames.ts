import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { enumTable, structure } from '../definition/schema';


export const createGlobalEnumAndStructureNamesDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'collection',
    key: 'global-enum-and-structure-name-duplication',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: enumTable.id,
            name: enumTable.name,
            type: enumTable.type,
          })
          .from(enumTable)
          .unionAll(
            databaseHelper
              .select({
                id: structure.id,
                name: structure.name,
                type: structure.type,
              })
              .from(structure)
          )
      )

      const subscription = await extensionContext.data.subscribe({
        query,
        listener: async (data) => listener({ resources: mapResult(data) })
      });

      return async () => {
        await subscription();
      }
    },
    execute: async ({ resources, addDiagnostic }) => {
      for (const resource of resources) {
        if (resources.filter(res => res.name === resource.name).length <= 1) return;

        addDiagnostic(
          new DiagnosticViewItem({
            key: `global-enum-and-structure-name-duplication:${resource.id}`,
            initialValue: {
              ruleId: 'global-name-duplication',
              message: `The name "${resource.name}" for "${resource.type}" is duplicated in the project`,
              severity: 'error',

              code: 'duplicated-global-name',
              category: 'naming',

              target: {
                resourceType: resource.type,
                resourceId: resource.id,
                property: 'name',
              },

              documentation: {
                summary: 'All resource names must be globally unique across the project, regardless of their type.'
              }
            },
          }),
        );
      }
    }
  })
}
