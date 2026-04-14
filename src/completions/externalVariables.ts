import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { externalVariable, property } from '../definition/schema';


export const createExternalVariableCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'externalVariable',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'actionParameter') {
        const externalVariables = await databaseHelper
          .select({
            name: property.name,
            id: externalVariable.id,
            type: externalVariable.type,
            description: property.description
          })
          .from(externalVariable)
          .innerJoin(property, eq(property.id, externalVariable.propertyId))

        if (intent.kind === 'reference') return [
          ...externalVariables.map(externalVariable => (
            new CompletionViewItem({
              key: externalVariable.id,
              initialValue: {
                label: externalVariable.name,
                icon: { path: 'external-variable.svg' },
                value: { type: 'externalVariable', referenceId: externalVariable.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
