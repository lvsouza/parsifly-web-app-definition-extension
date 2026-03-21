import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { componentEvent, event } from '../definition/schema';


export const createComponentEventCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'componentEvent',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'componentListener') {
        if (!intent.visibility.key) return [];

        const componentEvents = await databaseHelper
          .select({
            name: event.name,
            id: componentEvent.id,
            type: componentEvent.type,
            description: event.description
          })
          .from(componentEvent)
          .innerJoin(event, eq(event.id, componentEvent.eventId))
          .where(eq(componentEvent.parentComponentId, intent.visibility.key))

        if (intent.kind === 'reference') return [
          ...componentEvents.map(componentEvent => (
            new CompletionViewItem({
              key: componentEvent.id,
              initialValue: {
                label: componentEvent.name,
                icon: { path: 'component-event.svg' },
                value: { type: 'componentEvent', referenceId: componentEvent.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
