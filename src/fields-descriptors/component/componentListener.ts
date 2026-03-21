import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { componentListener } from '../../definition/schema';


export const createComponentListenerFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-componentListener-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'componentListener') return [];

      const [result] = await databaseHelper
        .select({
          id: componentListener.id,
          parentComponentId: componentListener.parentComponentId,
          componentListenerId: sql<string | undefined>`${componentListener.id}`.as('componentListenerId')
        })
        .from(componentListener)
        .where(eq(componentListener.id, target.id))
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
                .select({ name: componentListener.name })
                .from(componentListener)
                .where(eq(componentListener.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(componentListener)
                .set({ name: value })
                .where(eq(componentListener.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `componentEventId:${result.id}`,
          initialValue: {
            label: 'Event',
            type: 'autocomplete',
            name: 'componentEventId',
            description: 'Define a event to listen',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ componentEventId: componentEventIdValue }] = await databaseHelper
                .select({ componentEventId: componentListener.componentEventId })
                .from(componentListener)
                .where(eq(componentListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => completion.value.referenceId === componentEventIdValue);
              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um componentEvent e tem o id de referência dela
              if ('type' in value && value.type === 'componentEvent' && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(componentListener)
                    .set({
                      componentEventId: value.referenceId as string,
                    })
                    .where(eq(componentListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const completionsResult = await extensionContext.completions.get({
                kind: 'reference',
                visibility: {
                  type: 'componentListener',
                  key: result.parentComponentId,
                }
              });

              return completionsResult;
            },
          },
        }),
        new FieldViewItem({
          key: `componentActionId:${result.id}`,
          initialValue: {
            label: 'Action',
            type: 'autocomplete',
            name: 'componentActionId',
            description: 'Define a action to be called when the event is triggered',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ componentActionId: componentActionIdValue }] = await databaseHelper
                .select({ componentActionId: componentListener.componentActionId })
                .from(componentListener)
                .where(eq(componentListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => completion.value.referenceId === componentActionIdValue);
              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um componentAction e tem o id de referência dela
              if ('type' in value && value.type === 'componentAction' && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(componentListener)
                    .set({
                      componentActionId: value.referenceId as string,
                    })
                    .where(eq(componentListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const completionResult = await extensionContext.completions.get({
                kind: 'callable',
                visibility: {
                  type: 'componentListener',
                  key: result.parentComponentId,
                },
              });

              return completionResult;
            },
          },
        }),
      ];
    }
  });
}

