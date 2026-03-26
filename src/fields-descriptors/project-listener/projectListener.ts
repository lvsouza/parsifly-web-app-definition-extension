import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { actionParameter, externalActionParameter, projectAction, projectEvent, projectListener, property } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadActionParameter } from './actionParameter';


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

      const actionIdQuery = databaseHelper
        .select({ actionId: sql<string>`coalesce(${projectListener.externalActionId}, ${projectAction.actionId})`.as("actionId") })
        .from(projectListener)
        .leftJoin(projectAction, eq(projectAction.id, projectListener.projectActionId))
        .leftJoin(projectEvent, eq(projectEvent.id, projectListener.projectEventId))
        .where(eq(projectListener.id, result.id))
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
                  projectEventId: projectListener.projectEventId,
                  externalEventId: projectListener.externalEventId,
                })
                .from(projectListener)
                .where(eq(projectListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectEventIdValue
                || completion.value.referenceId === externalEventIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectEvent e tem o id de referência dela
              if ('type' in value && ['projectEvent', 'externalEvent'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(projectListener)
                    .set({
                      externalEventId: value.type === 'externalEvent' ? value.referenceId as string : null,
                      projectEventId: value.type === 'projectEvent' ? value.referenceId as string : null,
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
          key: `actionId:${result.id}`,
          initialValue: {
            label: 'Action',
            name: 'actionId',
            type: 'autocomplete',
            children: items.length > 0,
            description: 'Define a action to be called when the event is triggered',
            getValue: async (context) => {
              const completions = await context.currentValue.getCompletions?.(undefined, context) || [];

              const [{ projectActionId: projectActionIdValue, externalActionId: externalActionIdValue }] = await databaseHelper
                .select({
                  projectActionId: projectListener.projectActionId,
                  externalActionId: projectListener.externalActionId,
                })
                .from(projectListener)
                .where(eq(projectListener.id, result.id))
                .limit(1);

              const completion = completions.find((completion: any) => (
                completion.value.referenceId === projectActionIdValue
                || completion.value.referenceId === externalActionIdValue
              ));

              return completion || null;
            },
            onDidChange: async (value: { type: string, referenceId: string }, context) => {
              // Garante que é um projectAction e tem o id de referência dela
              if ('type' in value && ['projectAction', 'externalAction'].includes(value.type) && 'referenceId' in value && typeof value.referenceId === 'string') {
                await databaseHelper.transaction(async trx => {
                  await trx
                    .update(projectListener)
                    .set({
                      externalActionId: value.type === 'externalAction' ? value.referenceId as string : null,
                      projectActionId: value.type === 'projectAction' ? value.referenceId as string : null,
                    })
                    .where(eq(projectListener.id, result.id))
                });
              }

              await context.reloadValue();
              await context.refetchChildren();
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
            getItems: async () => {
              return await Promise.all(
                items.map(item => loadActionParameter({
                  extensionContext,
                  current: {
                    id: item.id,
                    name: item.name,
                    type: item.type,
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
                await context.set('children', items.length > 0);
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

