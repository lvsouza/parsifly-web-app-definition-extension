import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { projectListener } from '../../definition/schema';


export const createProjectListenerFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-projectListener-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'projectListener') return [];

      const [result] = await databaseHelper
        .select({ id: projectListener.id, projectListenerId: sql<string | undefined>`${projectListener.id}`.as('projectListenerId') })
        .from(projectListener)
        .where(eq(projectListener.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Listener',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change listener name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: projectListener.name })
                .from(projectListener)
                .where(eq(projectListener.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(projectListener)
                .set({ name: value })
                .where(eq(projectListener.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `projectEventId:${result.id}`,
          initialValue: {
            label: 'Event',
            type: 'autocomplete',
            name: 'projectEventId',
            description: 'Define a event to listen',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectEventId: projectEventIdValue }] = await databaseHelper
                .select({ projectEventId: projectListener.projectEventId })
                .from(projectListener)
                .where(eq(projectListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => completion.value.referenceId === projectEventIdValue);
              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectEvent e tem o id de referência dela
              if ('type' in value && value.type === 'projectEvent' && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(projectListener)
                    .set({
                      projectEventId: value.referenceId as string,
                    })
                    .where(eq(projectListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'reference',
                visibility: {
                  type: 'projectListener',
                }
              });

              return result;
            },
          },
        }),
        new FieldViewItem({
          key: `projectActionId:${result.id}`,
          initialValue: {
            label: 'Action',
            type: 'autocomplete',
            name: 'projectActionId',
            description: 'Define a action to be called when the event is triggered',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectActionId: projectActionIdValue }] = await databaseHelper
                .select({ projectActionId: projectListener.projectActionId })
                .from(projectListener)
                .where(eq(projectListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => completion.value.referenceId === projectActionIdValue);
              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectAction e tem o id de referência dela
              if ('type' in value && value.type === 'projectAction' && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(projectListener)
                    .set({
                      projectActionId: value.referenceId as string,
                    })
                    .where(eq(projectListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const result = await extensionContext.completions.get({
                kind: 'callable',
                visibility: {
                  type: 'projectListener',
                }
              });

              return result;
            },
          },
        }),
      ];
    }
  });
}

