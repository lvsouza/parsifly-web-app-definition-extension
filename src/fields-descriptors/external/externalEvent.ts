import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { externalEvent, event } from '../../definition/schema';


export const createExternalEventFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalEvent-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalEvent') return [];

      const [result] = await databaseHelper
        .select({ id: externalEvent.id, eventId: externalEvent.eventId })
        .from(externalEvent)
        .where(eq(externalEvent.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External event',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external event name',
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
            description: 'Change external event description',
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
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external event visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: externalEvent.public })
                .from(externalEvent)
                .where(eq(externalEvent.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(externalEvent)
                .set({ public: value })
                .where(eq(externalEvent.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `source-name:${result.id}`,
          initialValue: {
            type: 'text',
            label: 'Source name',
            name: 'sourceName',
            description: 'Change external action Source name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ sourceName: externalEvent.sourceName })
                .from(externalEvent)
                .where(eq(externalEvent.id, result.id))
                .limit(1);

              return item.sourceName || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(externalEvent)
                .set({ sourceName: value })
                .where(eq(externalEvent.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

