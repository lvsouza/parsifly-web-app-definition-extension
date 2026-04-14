import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { projectAction, action } from '../definition/schema';


export const createProjectActionCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'projectAction',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'projectListener') {
        const projectActions = await databaseHelper
          .select({
            name: action.name,
            id: projectAction.id,
            type: projectAction.type,
            description: action.description
          })
          .from(projectAction)
          .innerJoin(action, eq(action.id, projectAction.actionId))

        if (intent.kind === 'callable') return [
          ...projectActions.map(projectAction => (
            new CompletionViewItem({
              key: projectAction.id,
              initialValue: {
                label: projectAction.name,
                icon: { path: 'project-action.svg' },
                value: { type: 'projectAction', referenceId: projectAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'componentListener') {
        const projectActions = await databaseHelper
          .select({
            name: action.name,
            id: projectAction.id,
            type: projectAction.type,
            description: action.description
          })
          .from(projectAction)
          .innerJoin(action, eq(action.id, projectAction.actionId))

        if (intent.kind === 'callable') return [
          ...projectActions.map(projectAction => (
            new CompletionViewItem({
              key: projectAction.id,
              initialValue: {
                label: projectAction.name,
                icon: { path: 'project-action.svg' },
                value: { type: 'projectAction', referenceId: projectAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'pageListener') {
        const projectActions = await databaseHelper
          .select({
            name: action.name,
            id: projectAction.id,
            type: projectAction.type,
            description: action.description
          })
          .from(projectAction)
          .innerJoin(action, eq(action.id, projectAction.actionId))

        if (intent.kind === 'callable') return [
          ...projectActions.map(projectAction => (
            new CompletionViewItem({
              key: projectAction.id,
              initialValue: {
                label: projectAction.name,
                icon: { path: 'project-action.svg' },
                value: { type: 'projectAction', referenceId: projectAction.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'actionParameter') {
        const projectActions = await databaseHelper
          .select({
            name: action.name,
            id: projectAction.id,
            type: projectAction.type,
            description: action.description
          })
          .from(projectAction)
          .innerJoin(action, eq(action.id, projectAction.actionId))

        if (intent.kind === 'callable') return [
          ...projectActions.map(projectAction => (
            new CompletionViewItem({
              key: projectAction.id,
              initialValue: {
                label: projectAction.name,
                icon: { path: 'project-action.svg' },
                value: { type: 'projectAction', referenceId: projectAction.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
