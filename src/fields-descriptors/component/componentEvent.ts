import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { componentEvent, event } from '../../definition/schema';


export const createComponentEventFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-componentEvent-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'componentEvent') return [];

      const [result] = await databaseHelper
        .select({ id: componentEvent.id, eventId: componentEvent.eventId })
        .from(componentEvent)
        .where(eq(componentEvent.eventId, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Component event',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change component event name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: event.name })
                .from(event)
                .where(eq(event.id, result.eventId))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(event)
                .set({ name: value })
                .where(eq(event.id, result.eventId));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change component event description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: event.description })
                .from(event)
                .where(eq(event.id, result.eventId))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(event)
                .set({ description: value })
                .where(eq(event.id, result.eventId));
            },
          }
        }),
      ];
    }
  });
}

