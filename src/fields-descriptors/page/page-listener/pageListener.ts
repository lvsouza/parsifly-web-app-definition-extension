import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { actionParameter, externalActionParameter, pageAction, pageListener, projectAction, projectEvent, property } from '../../../definition/schema';
import { loadActionParameter } from './actionParameter';


export const createPageListenerFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-pageListener-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'pageListener') return [];

      const [result] = await databaseHelper
        .select({
          id: pageListener.id,
          parentPageId: pageListener.parentPageId,
          pageListenerId: sql<string | undefined>`${pageListener.id}`.as('pageListenerId')
        })
        .from(pageListener)
        .where(eq(pageListener.id, target.id))
        .limit(1);

      if (!result) return [];

      const actionIdQuery = databaseHelper
        .select({
          actionId: sql<string>`coalesce(${pageListener.externalActionId}, ${projectAction.actionId}, ${pageAction.actionId})`.as("actionId"),
        })
        .from(pageListener)
        .leftJoin(pageAction, eq(pageAction.id, pageListener.pageActionId))
        .leftJoin(projectAction, eq(projectAction.id, pageListener.projectActionId))
        .leftJoin(projectEvent, eq(projectEvent.id, pageListener.projectEventId))
        .where(eq(pageListener.id, result.id))
      const loadItemsQuery = databaseHelper
        .select({
          name: property.name,
          id: actionParameter.id,
          type: actionParameter.type,
          required: property.required,
          description: property.description,
        })
        .from(actionParameter)
        .innerJoin(property, eq(property.id, actionParameter.propertyId))
        .where(eq(actionParameter.parentActionId, actionIdQuery))
        .unionAll(
          databaseHelper
            .select({
              name: property.name,
              id: externalActionParameter.id,
              type: externalActionParameter.type,
              required: property.required,
              description: property.description,
            })
            .from(externalActionParameter)
            .innerJoin(property, eq(property.id, externalActionParameter.propertyId))
            .where(eq(externalActionParameter.parentExternalActionId, actionIdQuery))
        )

      let items = await loadItemsQuery.execute()


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
                .select({ name: pageListener.name })
                .from(pageListener)
                .where(eq(pageListener.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(pageListener)
                .set({ name: value })
                .where(eq(pageListener.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `eventId:${result.id}`,
          initialValue: {
            label: 'Event',
            name: 'eventId',
            type: 'autocomplete',
            description: 'Define a event to listen',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectEventId: projectEventIdValue, externalEventId: externalEventIdValue }] = await databaseHelper
                .select({
                  projectEventId: pageListener.projectEventId,
                  externalEventId: pageListener.externalEventId,
                })
                .from(pageListener)
                .where(eq(pageListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectEventIdValue
                || completion.value.referenceId === externalEventIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um pageEvent e tem o id de referência dela
              if ('type' in value && ['projectEvent', 'externalEvent'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(pageListener)
                    .set({
                      externalEventId: value.type === 'externalEvent' ? value.referenceId as string : null,
                      projectEventId: value.type === 'projectEvent' ? value.referenceId as string : null,
                    })
                    .where(eq(pageListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const completionsResult = await extensionContext.completions.get({
                kind: 'reference',
                visibility: {
                  type: 'pageListener',
                  key: result.parentPageId,
                }
              });

              return completionsResult;
            },
          },
        }),
        new FieldViewItem({
          key: `actionId:${result.id}`,
          initialValue: {
            label: 'Action',
            name: 'actionId',
            type: 'autocomplete',
            children: items.length > 0,
            description: 'Define a action to be called when the event is triggered',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectActionId: projectActionIdValue, externalActionId: externalActionIdValue, pageActionId: pageActionIdValue }] = await databaseHelper
                .select({
                  externalActionId: pageListener.externalActionId,
                  projectActionId: pageListener.projectActionId,
                  pageActionId: pageListener.pageActionId,
                })
                .from(pageListener)
                .where(eq(pageListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectActionIdValue
                || completion.value.referenceId === externalActionIdValue
                || completion.value.referenceId === pageActionIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectAction e tem o id de referência dela
              if ('type' in value && ['projectAction', 'externalAction', 'pageAction'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(pageListener)
                    .set({
                      externalActionId: value.type === 'externalAction' ? value.referenceId as string : null,
                      projectActionId: value.type === 'projectAction' ? value.referenceId as string : null,
                      pageActionId: value.type === 'pageAction' ? value.referenceId as string : null,
                    })
                    .where(eq(pageListener.id, result.id))
                });
              }

              await context.reloadValue();
            },
            getCompletions: async () => {
              const completionResult = await extensionContext.completions.get({
                kind: 'callable',
                visibility: {
                  type: 'pageListener',
                  key: result.parentPageId,
                },
              });

              return completionResult;
            },
            getItems: async () => {
              return await Promise.all(
                items.map(item => loadActionParameter({
                  extensionContext,
                  current: {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                  }
                }))
              );
            },
          },
          onDidMount: async (context) => {
            const [query, mapResult] = mappableQuery(loadItemsQuery)
            const itemsUnSubscription = await extensionContext.data.subscribe({
              query,
              listener: async (data) => {
                items = mapResult(data);
                await context.set('children', items.length > 0)
                await context.refetchChildren();
              },
            })

            return () => {
              itemsUnSubscription();
            };
          },
        }),
      ];
    }
  });
}
