import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { projectEvent, event } from '../definition/schema';


export const createProjectEventCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'projectEvent',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'projectListener') {
        const projectEvents = await databaseHelper
          .select({
            name: event.name,
            id: projectEvent.id,
            type: projectEvent.type,
            description: event.description
          })
          .from(projectEvent)
          .innerJoin(event, eq(event.id, projectEvent.eventId))

        if (intent.kind === 'reference') return [
          ...projectEvents.map(projectEvent => (
            new CompletionViewItem({
              key: projectEvent.id,
              initialValue: {
                label: projectEvent.name,
                icon: { path: 'project-event.svg' },
                value: { type: 'projectEvent', referenceId: projectEvent.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'componentListener') {
        const projectEvents = await databaseHelper
          .select({
            name: event.name,
            id: projectEvent.id,
            type: projectEvent.type,
            description: event.description
          })
          .from(projectEvent)
          .innerJoin(event, eq(event.id, projectEvent.eventId))

        if (intent.kind === 'reference') return [
          ...projectEvents.map(projectEvent => (
            new CompletionViewItem({
              key: projectEvent.id,
              initialValue: {
                label: projectEvent.name,
                icon: { path: 'project-event.svg' },
                value: { type: 'projectEvent', referenceId: projectEvent.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'pageListener') {
        const projectEvents = await databaseHelper
          .select({
            name: event.name,
            id: projectEvent.id,
            type: projectEvent.type,
            description: event.description
          })
          .from(projectEvent)
          .innerJoin(event, eq(event.id, projectEvent.eventId))

        if (intent.kind === 'reference') return [
          ...projectEvents.map(projectEvent => (
            new CompletionViewItem({
              key: projectEvent.id,
              initialValue: {
                label: projectEvent.name,
                icon: { path: 'project-event.svg' },
                value: { type: 'projectEvent', referenceId: projectEvent.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
