import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { pageAction, action } from '../definition/schema';


export const createPageActionCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'pageAction',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'pageListener') {
        if (!intent.visibility.key) return [];

        const pageActions = await databaseHelper
          .select({
            name: action.name,
            id: pageAction.id,
            type: pageAction.type,
            description: action.description
          })
          .from(pageAction)
          .innerJoin(action, eq(action.id, pageAction.actionId))
          .where(eq(pageAction.parentPageId, intent.visibility.key))

        if (intent.kind === 'callable') return [
          ...pageActions.map(pageAction => (
            new CompletionViewItem({
              key: pageAction.id,
              initialValue: {
                label: pageAction.name,
                icon: { path: 'page-action.svg' },
                value: { type: 'pageAction', referenceId: pageAction.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
