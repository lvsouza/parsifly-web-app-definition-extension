import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createEnumDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'enum-rules',
    query: (
      databaseHelper
        .selectFrom('enum')
        .leftJoin('enumAttribute', 'enumAttribute.parentEnumId', 'enum.id')
        .select([
          'enum.id',
          'enum.name',
          'enum.type',
          databaseHelper.fn.count('enumAttribute.id').as('enumAttributeCount'),
        ])
        .groupBy(['enum.id', 'enum.name', 'enum.type'])
        .compile()
    ),
    execute: async ({ resource, addDiagnostic }) => {
      if (resource.enumAttributeCount > 0) {
        return;
      }

      addDiagnostic(
        new DiagnosticViewItem({
          key: `enum-without-attributes:${resource.id}`,
          initialValue: {
            ruleId: 'enum-must-have-attributes',
            message: `The enum "${resource.name}" must define at least one attribute`,
            severity: 'error',

            code: 'enum-without-attributes',
            category: 'validation',

            target: {
              resourceType: resource.type,
              resourceId: resource.id,
            },

            documentation: {
              summary: 'Enums must define at least one attribute so their values can carry structured data.',
            },
          },
        }),
      );
    },
  });
}
