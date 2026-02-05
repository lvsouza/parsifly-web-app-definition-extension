import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createEnumAttributeDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'enum-attribute-rules',
    query: (
      databaseHelper
        .selectFrom('enumAttribute')
        .select(['id', 'name', 'type', 'dataType', 'defaultValue'])
        .compile()
    ),
    execute: async ({ resource, addDiagnostic }) => {

      // Check enum attribute defaultValue to be right dataType
      if (resource.defaultValue !== null && resource.dataType !== typeof resource.defaultValue) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `enum-attribute-default-value-type-mismatch:${resource.id}`,
            initialValue: {
              ruleId: 'enum-attribute-default-value-type-mismatch',
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
                summary: 'When a default value is defined, its type must match the attribute data type.',
              },
            },
          }),
        );
      }

    }
  })
}
