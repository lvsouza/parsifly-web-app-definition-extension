import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { externalAction } from '../definition/schema';


export const createExternalActionCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'externalAction',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'projectListener') {
        const externalActions = await databaseHelper
          .select({
            id: externalAction.id,
            name: externalAction.name,
            type: externalAction.type,
            description: externalAction.description
          })
          .from(externalAction)

        if (intent.kind === 'callable') return [
          ...externalActions.map(externalAction => (
            new CompletionViewItem({
              key: externalAction.id,
              initialValue: {
                label: externalAction.name,
                icon: { path: 'external-action.svg' },
                value: { type: 'externalAction', referenceId: externalAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'componentListener') {
        const externalActions = await databaseHelper
          .select({
            id: externalAction.id,
            type: externalAction.type,
            name: externalAction.name,
            description: externalAction.description
          })
          .from(externalAction)

        if (intent.kind === 'callable') return [
          ...externalActions.map(externalAction => (
            new CompletionViewItem({
              key: externalAction.id,
              initialValue: {
                label: externalAction.name,
                icon: { path: 'external-action.svg' },
                value: { type: 'externalAction', referenceId: externalAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'pageListener') {
        const externalActions = await databaseHelper
          .select({
            id: externalAction.id,
            type: externalAction.type,
            name: externalAction.name,
            description: externalAction.description
          })
          .from(externalAction)

        if (intent.kind === 'callable') return [
          ...externalActions.map(externalAction => (
            new CompletionViewItem({
              key: externalAction.id,
              initialValue: {
                label: externalAction.name,
                icon: { path: 'external-action.svg' },
                value: { type: 'externalAction', referenceId: externalAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'actionParameter') {
        const externalActions = await databaseHelper
          .select({
            id: externalAction.id,
            type: externalAction.type,
            name: externalAction.name,
            description: externalAction.description
          })
          .from(externalAction)

        if (intent.kind === 'callable') return [
          ...externalActions.map(externalAction => (
            new CompletionViewItem({
              key: externalAction.id,
              initialValue: {
                label: externalAction.name,
                icon: { path: 'external-action.svg' },
                value: { type: 'externalAction', referenceId: externalAction.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
