import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { externalEvent, event } from '../definition/schema';


export const createExternalEventCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'externalEvent',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'projectListener') {
        const externalEvents = await databaseHelper
          .select({
            name: event.name,
            id: externalEvent.id,
            type: externalEvent.type,
            description: event.description
          })
          .from(externalEvent)
          .innerJoin(event, eq(event.id, externalEvent.eventId))

        if (intent.kind === 'reference') return [
          ...externalEvents.map(externalEvent => (
            new CompletionViewItem({
              key: externalEvent.id,
              initialValue: {
                label: externalEvent.name,
                icon: { path: 'external-event.svg' },
                value: { type: 'externalEvent', referenceId: externalEvent.id },
              },
            })
          )),
        ];
      } else if (intent.visibility?.type === 'componentListener') {
        const externalEvents = await databaseHelper
          .select({
            name: event.name,
            id: externalEvent.id,
            type: externalEvent.type,
            description: event.description
          })
          .from(externalEvent)
          .innerJoin(event, eq(event.id, externalEvent.eventId))

        if (intent.kind === 'reference') return [
          ...externalEvents.map(externalEvent => (
            new CompletionViewItem({
              key: externalEvent.id,
              initialValue: {
                label: externalEvent.name,
                icon: { path: 'external-event.svg' },
                value: { type: 'externalEvent', referenceId: externalEvent.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
