import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { projectAction, action } from '../../definition/schema';


export const createProjectActionFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-projectAction-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'projectAction') return [];

      const [result] = await databaseHelper
        .select({ id: action.id, projectActionId: sql<string | undefined>`${projectAction.id}`.as('projectActionId') })
        .from(action)
        .leftJoin(projectAction, eq(projectAction.actionId, action.id))
        .where(eq(action.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Action',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change action name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: action.name })
                .from(action)
                .where(eq(action.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(action)
                .set({ name: value })
                .where(eq(action.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change action description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: action.description })
                .from(action)
                .where(eq(action.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(action)
                .set({ description: value })
                .where(eq(action.id, result.id));
            },
          }
        }),
      ];
    }
  });
}

