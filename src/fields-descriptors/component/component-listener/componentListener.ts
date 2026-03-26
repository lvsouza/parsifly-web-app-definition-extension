import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { actionParameter, componentAction, componentEvent, componentListener, externalActionParameter, projectAction, projectEvent, property } from '../../../definition/schema';
import { loadActionParameter } from './actionParameter';


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

      const actionIdQuery = databaseHelper
        .select({
          actionId: sql<string>`coalesce(${componentListener.externalActionId}, ${projectAction.actionId}, ${componentAction.actionId})`.as("actionId"),
        })
        .from(componentListener)
        .leftJoin(componentAction, eq(componentAction.id, componentListener.componentActionId))
        .leftJoin(componentEvent, eq(componentEvent.id, componentListener.componentEventId))
        .leftJoin(projectAction, eq(projectAction.id, componentListener.projectActionId))
        .leftJoin(projectEvent, eq(projectEvent.id, componentListener.projectEventId))
        .where(eq(componentListener.id, result.id))
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
          key: `eventId:${result.id}`,
          initialValue: {
            label: 'Event',
            name: 'eventId',
            type: 'autocomplete',
            description: 'Define a event to listen',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectEventId: projectEventIdValue, externalEventId: externalEventIdValue, componentEventId: componentEventIdValue }] = await databaseHelper
                .select({
                  projectEventId: componentListener.projectEventId,
                  externalEventId: componentListener.externalEventId,
                  componentEventId: componentListener.componentEventId,
                })
                .from(componentListener)
                .where(eq(componentListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectEventIdValue
                || completion.value.referenceId === externalEventIdValue
                || completion.value.referenceId === componentEventIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um componentEvent e tem o id de referência dela
              if ('type' in value && ['projectEvent', 'externalEvent', 'componentEvent'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(componentListener)
                    .set({
                      componentEventId: value.type === 'componentEvent' ? value.referenceId as string : null,
                      externalEventId: value.type === 'externalEvent' ? value.referenceId as string : null,
                      projectEventId: value.type === 'projectEvent' ? value.referenceId as string : null,
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
          key: `actionId:${result.id}`,
          initialValue: {
            children: true,
            label: 'Action',
            name: 'actionId',
            type: 'autocomplete',
            description: 'Define a action to be called when the event is triggered',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectActionId: projectActionIdValue, externalActionId: externalActionIdValue, componentActionId: componentActionIdValue }] = await databaseHelper
                .select({
                  projectActionId: componentListener.projectActionId,
                  externalActionId: componentListener.externalActionId,
                  componentActionId: componentListener.componentActionId,
                })
                .from(componentListener)
                .where(eq(componentListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectActionIdValue
                || completion.value.referenceId === externalActionIdValue
                || completion.value.referenceId === componentActionIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectAction e tem o id de referência dela
              if ('type' in value && ['projectAction', 'externalAction', 'componentAction'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(componentListener)
                    .set({
                      componentActionId: value.type === 'componentAction' ? value.referenceId as string : null,
                      externalActionId: value.type === 'externalAction' ? value.referenceId as string : null,
                      projectActionId: value.type === 'projectAction' ? value.referenceId as string : null,
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

