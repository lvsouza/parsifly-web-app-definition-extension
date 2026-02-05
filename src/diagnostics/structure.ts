import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createStructureDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'structure-rules',
    query: (
      databaseHelper
        .selectFrom('structure')
        .leftJoin('structureAttribute', 'structureAttribute.parentStructureId', 'structure.id')
        .select([
          'structure.id',
          'structure.name',
          'structure.type',
          databaseHelper.fn.count('structureAttribute.id').as('structureAttributeCount'),
        ])
        .groupBy(['structure.id', 'structure.name', 'structure.type'])
        .compile()
    ),
    execute: async ({ resource, addDiagnostic }) => {
      if (resource.structureAttributeCount > 0) {
        return;
      }

      addDiagnostic(
        new DiagnosticViewItem({
          key: `structure-without-attributes:${resource.id}`,
          initialValue: {
            ruleId: 'structure-must-have-attributes',
            message: `The structure "${resource.name}" must define at least one attribute`,
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
