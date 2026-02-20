import { TExtensionContext, DiagnosticAnalyzer, DiagnosticViewItem } from 'parsifly-extension-base';

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { folder } from '../definition/schema';


export const createFolderNamesDiagnosticsAnalyzer = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new DiagnosticAnalyzer({
    mode: 'perResource',
    key: 'folder-names-diagnostics',
    subscribe: async (listener) => {
      const [query, mapResult] = mappableQuery(
        databaseHelper
          .select({
            id: folder.id,
            name: folder.name,
          })
          .from(folder)
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

      if (resource.name.length < 3) {
        addDiagnostic(
          new DiagnosticViewItem({
            key: `min-3-folder-name-length:${resource.id}`,
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
