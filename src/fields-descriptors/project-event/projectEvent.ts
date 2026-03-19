import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { projectEvent, event } from '../../definition/schema';


export const createProjectEventFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-projectEvent-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'projectEvent') return [];

      const [result] = await databaseHelper
        .select({ id: event.id, projectEventId: sql<string | undefined>`${projectEvent.id}`.as('projectEventId') })
        .from(event)
        .leftJoin(projectEvent, eq(projectEvent.eventId, event.id))
        .where(eq(event.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Project event',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change event name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: event.name })
                .from(event)
                .where(eq(event.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(event)
                .set({ name: value })
                .where(eq(event.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change event description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: event.description })
                .from(event)
                .where(eq(event.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(event)
                .set({ description: value })
                .where(eq(event.id, result.id));
            },
          }
        }),
      ];
    }
  });
}

