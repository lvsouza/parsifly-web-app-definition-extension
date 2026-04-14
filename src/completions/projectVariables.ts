import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { projectVariable, property } from '../definition/schema';


export const createProjectVariableCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'projectVariable',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'actionParameter') {
        const projectVariables = await databaseHelper
          .select({
            name: property.name,
            id: projectVariable.id,
            type: projectVariable.type,
            description: property.description
          })
          .from(projectVariable)
          .innerJoin(property, eq(property.id, projectVariable.propertyId))

        if (intent.kind === 'reference') return [
          ...projectVariables.map(projectVariable => (
            new CompletionViewItem({
              key: projectVariable.id,
              initialValue: {
                label: projectVariable.name,
                icon: { path: 'project-variable.svg' },
                value: { type: 'projectVariable', referenceId: projectVariable.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
