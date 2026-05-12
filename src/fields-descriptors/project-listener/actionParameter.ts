import { FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { and, eq } from 'drizzle-orm';

import { ActionParameter, expression, expressionNode, expressionNodeConnection, ProjectListener, projectListenerActionParameter, Property } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';


interface IGetProjectListenerSelectedActionParamsProps {
  extensionContext: TExtensionContext;
  projectListener: Pick<ProjectListener, 'id'>
  current: Pick<ActionParameter, 'id' | 'type' | 'projectOwnerId'> & Pick<Property, 'name' | 'description'>
}
export const loadActionParameter = async ({ current, projectListener, extensionContext }: IGetProjectListenerSelectedActionParamsProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const expressionDefinedQuery = databaseHelper
    .select({
      id: projectListenerActionParameter.id,
      type: projectListenerActionParameter.type,
      expressionId: projectListenerActionParameter.expressionId,
    })
    .from(projectListenerActionParameter)
    .where(
      and(
        eq(projectListenerActionParameter.actionParameterId, current.id),
        eq(projectListenerActionParameter.projectListenerId, projectListener.id),
      )
    );

  let expressionDefined = await expressionDefinedQuery.execute().then(result => result.at(0));


  return new FieldViewItem({
    key: `name:${current.id}`,
    initialValue: {
      name: 'name',
      error: undefined,
      type: 'expression',
      label: current.name,
      description: current.description || undefined,
      getValue: async () => {
        if (expressionDefined) {
          return '(click to edit)';
        }

        return '(click to define)';
      },
      onDidClick: async () => {
        if (!expressionDefined) {
          const expressionId = await databaseHelper.transaction(async (trx) => {
            const [{ id: expressionId }] = await trx
              .insert(expression)
              .values({
                projectOwnerId: current.projectOwnerId,
              })
              .returning({
                id: expression.id
              });
            await trx
              .insert(projectListenerActionParameter)
              .values({
                expressionId,
                actionParameterId: current.id,
                projectListenerId: projectListener.id,
                projectOwnerId: current.projectOwnerId,
              });
            const [{ id: startId }] = await trx
              .insert(expressionNode)
              .values({
                top: 50,
                left: 50,
                name: 'String',
                nodeType: 'inputString',
                parentExpressionId: expressionId,
                projectOwnerId: current.projectOwnerId,
              })
              .returning({ id: expressionNode.id });
            const [{ id: endId }] = await trx
              .insert(expressionNode)
              .values({
                top: 50,
                left: 300,
                name: 'Output',
                nodeType: 'output',
                parentExpressionId: expressionId,
                projectOwnerId: current.projectOwnerId,
              })
              .returning({ id: expressionNode.id });
            await trx
              .insert(expressionNodeConnection)
              .values({
                projectOwnerId: current.projectOwnerId,
                fromExpressionNodeId: startId,
                toExpressionNodeId: endId,
              });
          });

          extensionContext.views.open({
            key: 'expression-editor',
            windowMode: true,
            customData: {
              resourceId: expressionId,
            },
          });
          return;
        }

        extensionContext.views.open({
          key: 'expression-editor',
          windowMode: true,
          customData: {
            resourceId: expressionDefined.expressionId,
          },
        });
      },
    },
    onDidMount: async (context) => {

      const [query, mapResult] = mappableQuery(expressionDefinedQuery)
      const unsubscribe = await extensionContext.data.subscribe({
        query,
        listener: async (data) => {
          expressionDefined = mapResult(data).at(0);
          context.reloadValue();
        }
      });

      return async () => {
        await unsubscribe();
      };
    }
  })
}

