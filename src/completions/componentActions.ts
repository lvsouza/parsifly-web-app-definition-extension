import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { componentAction, action } from '../definition/schema';


export const createComponentActionCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'componentAction',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'componentListener') {
        if (!intent.visibility.key) return [];

        const componentActions = await databaseHelper
          .select({
            name: action.name,
            id: componentAction.id,
            type: componentAction.type,
            description: action.description
          })
          .from(componentAction)
          .innerJoin(action, eq(action.id, componentAction.actionId))
          .where(eq(componentAction.parentComponentId, intent.visibility.key))

        if (intent.kind === 'callable') return [
          ...componentActions.map(componentAction => (
            new CompletionViewItem({
              key: componentAction.id,
              initialValue: {
                label: componentAction.name,
                icon: { path: 'component-action.svg' },
                value: { type: 'componentAction', referenceId: componentAction.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
