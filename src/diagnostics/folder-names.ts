import { TApplication, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createFolderNamesDiagnosticsAnalyzer = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new DiagnosticAnalyzer({
    key: 'folder-names-diagnostics',
    mode: 'perResource',
    query: (
      databaseHelper
        .selectFrom('folder')
        .select(['id', 'name'])
        .compile()
    ),
    execute: async ({ resource, addDiagnostic }) => {

      if (resource.name.length < 3) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: 'min-3-folder-name-length',
            initialValue: {
              ruleId: 'folder-name-min-length',
              message: 'A folder should have at least 3 characters',
              severity: 'error',

              code: 'min-3-folder-name-length',
              category: 'naming',

              target: {
                resourceType: 'folder',
                resourceId: resource.id,
                property: 'name'
              },

              documentation: {
                summary: 'Folder names must contain at least 3 characters to remain readable.'
              }
            }
          })
        );
      }
    }
  })
}
