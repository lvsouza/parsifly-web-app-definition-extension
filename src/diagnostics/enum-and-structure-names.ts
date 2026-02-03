import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createGlobalEnumAndStructureNamesDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new DiagnosticAnalyzer({
    key: 'global-enum-and-structure-name-duplication',
    mode: 'collection',
    query: (
      databaseHelper
        .selectFrom('enum')
        .select(['id', 'name', 'type'])
        .unionAll(databaseHelper.selectFrom('structure').select(['id', 'name', 'type']))
        .compile()
    ),
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
