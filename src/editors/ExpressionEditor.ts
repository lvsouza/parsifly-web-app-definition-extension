import { View, Action, TExtensionContext, ViewContentWebView } from 'parsifly-extension-base';
import { eq, inArray } from 'drizzle-orm';

import { expression, expressionNode, expressionNodeConnection } from '../definition/schema';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


type TNodeDetails = {
  id: string;
  title: string;
  value: string | number | boolean | null;
  inputs: {
    id: string;
    name: string;
  }[];
  outputs: {
    id: string;
    name: string;
  }[];
}

export const createExpressionEditor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleLoadExpressionContent = async (resourceId: string) => {
    const nodes = await databaseHelper
      .select({
        id: expressionNode.id,
        top: expressionNode.top,
        left: expressionNode.left,
        nodeType: expressionNode.nodeType,
      })
      .from(expressionNode)
      .where(eq(expressionNode.parentExpressionId, resourceId));

    const nodeIds = nodes.map(node => node.id);

    const connections = await databaseHelper
      .select({
        id: expressionNodeConnection.id,
        toExpressionNodeId: expressionNodeConnection.toExpressionNodeId,
        fromExpressionNodeId: expressionNodeConnection.fromExpressionNodeId,
        fromHandleId: expressionNodeConnection.fromHandleId,
        toHandleId: expressionNodeConnection.toHandleId,
      })
      .from(expressionNodeConnection)
      .where(inArray(expressionNodeConnection.fromExpressionNodeId, nodeIds));

    return {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.nodeType,
        position: { x: node.left, y: node.top },
      })),
      edges: connections.map(connection => ({
        id: connection.id,
        target: connection.toExpressionNodeId,
        source: connection.fromExpressionNodeId,
        sourceHandle: connection.fromHandleId,
        targetHandle: connection.toHandleId,
      })),
    };
  }
  const handleLoadNodeDetails = async (nodeId: string): Promise<TNodeDetails> => {
    const [node] = await databaseHelper
      .select({
        id: expressionNode.id,
        name: expressionNode.name,
      })
      .from(expressionNode)
      .where(eq(expressionNode.id, nodeId))

    return {
      id: nodeId,
      inputs: [],
      outputs: [],
      value: 'teste',
      title: node.name || '',
    }
  }

  type TResource = { key: string; }
  const handleLoadExpressionContext = async ({ key }: TResource) => {
    const actions = await extensionContext.completions.get({
      kind: 'callable',
      visibility: { key, type: 'expression' },
    });
    const variables = await extensionContext.completions.get({
      kind: 'reference',
      visibility: { key, type: 'expression' },
    });

    return {
      options: [
        {
          id: 'basic-group',
          name: 'Basic',
          description: 'Basic nodes for expression builder',
          options: [
            { id: '1', name: 'String', type: 'inputString', value: 'Text', icon: '/dist/string.svg', description: 'Basic string input' },
            { id: '2', name: 'Number', type: 'inputNumber', value: 0, icon: '/dist/number.svg', description: 'Basic number input' },
            { id: '3', name: 'Boolean', type: 'inputBoolean', value: false, icon: '/dist/boolean.svg', description: 'Basic boolean input' },
            { id: '4', name: 'Binary', type: 'inputBinary', value: null, icon: '/dist/binary.svg', description: 'Basic binary input' },
            { id: '5', name: 'Object', type: 'inputObject', value: {}, icon: '/dist/object.svg', description: 'Basic object input' },
            { id: '6', name: 'Array', type: 'inputArray', value: [], icon: '/dist/array.svg', description: 'Basic array input' },
          ],
        },
        {
          id: 'condition-group',
          name: 'Conditions',
          description: 'Get condition node for expression builder',
          options: [
            { id: '11', name: 'If', type: 'if', value: null, icon: '/dist/if.svg', description: 'Basic IF, receive a condition value and return one of two values' },
          ],
        },
        {
          id: 'output-group',
          name: 'Output',
          description: 'Get output node for expression builder',
          options: [
            { id: '21', name: 'Output', type: 'output', value: null, icon: '/dist/output.svg', description: 'Basic output, receive a value e set as output' },
          ],
        },
        {
          id: 'variable-group',
          name: 'Variables',
          description: 'Get variable node for expression builder',
          options: [
            ...variables.map(variable => ({
              id: variable.key,
              name: variable.label,
              value: variable.value,
              type: 'inputGetVariable',
              description: variable.description,
              icon: `/dist/${variable.icon?.path}`,
            })),
          ],
        },
        {
          id: 'action-group',
          name: 'Actions',
          description: 'Call actions node for expression builder',
          options: [
            ...actions.map(action => ({
              id: action.key,
              name: action.label,
              value: action.value,
              type: 'inputCallAction',
              description: action.description,
              icon: `/dist/${action.icon?.path}`,
            })),
          ],
        },
      ],
    };
  }

  const handleNodeChanges = async (nodes: any[]) => {
    for (const node of nodes) {
      console.log('change node', node)

      if (node.type === 'position') {
        await databaseHelper
          .update(expressionNode)
          .set({
            top: node.position.y,
            left: node.position.x,
          })
          .where(eq(expressionNode.id, node.id))
      } else if (node.type === 'remove') {
        await databaseHelper
          .delete(expressionNode)
          .where(eq(expressionNode.id, node.id))
      }
    }
  }

  const handleNodeAdd = async (nodes: any[], resourceId: string) => {
    for (const node of nodes) {
      console.log('add node', node)

      const [result] = await databaseHelper
        .select({ projectOwnerId: expression.projectOwnerId })
        .from(expression)
        .where(eq(expression.id, resourceId))

      await databaseHelper
        .insert(expressionNode)
        .values({
          id: node.id,
          name: 'Output',
          nodeType: node.type,
          top: node.position.y,
          left: node.position.x,
          parentExpressionId: resourceId,
          projectOwnerId: result.projectOwnerId,
        })
    }
  }

  const handleEdgeChange = async (edges: any[]) => {
    for (const edge of edges) {
      console.log('edge', edge)
    }
  }

  const handleConnectionChange = async (connections: any[]) => {
    for (const connection of connections) {
      console.log('connection', connection)
    }
  }


  return new View({
    key: 'expression-editor',
    initialValue: {
      selector: [],
      allowWindow: true,
      position: 'editor',
      icon: { name: 'combine' },
      title: "Expression Editor",
      description: "This editor allow you to edit complex expressions used in the conditions or data sources",
      window: {
        width: 1100,
        height: 600,
      },
      getActions: async (context) => {
        return [
          new Action({
            key: 'reload',
            initialValue: {
              label: "Reload editor",
              icon: { name: "refresh" },
              description: "Reload editor",
              action: async () => {
                await context.refetch();
              },
            },
          }),
        ];
      },
      getViewContent: async (viewContext) => new ViewContentWebView({
        key: 'expression-editor-view-content',
        initialValue: {
          backgroundTransparent: true,
          entryPoint: {
            file: "index.html",
            basePath: "views/expression-editor",
          },
          onDidMessage: async (webViewContext, event, changes) => {
            if (typeof viewContext.customData !== 'object') return;

            const { resourceId } = viewContext.customData as any;

            if (event === 'request:update:context') {
              const result = await handleLoadExpressionContext({ key: resourceId });
              await webViewContext.sendMessage('update:context', result);
              return;
            } else if (event === 'request:update:content') {
              const result = await handleLoadExpressionContent(resourceId);
              await webViewContext.sendMessage('update:content', result);
              return;
            } else if (event === 'get:details') {
              const result = handleLoadNodeDetails(changes as string);
              return result;
            } else if (event === 'make:change:nodes') {
              const result = handleNodeChanges(changes as any);
              return result;
            } else if (event === 'make:add:nodes') {
              const result = handleNodeAdd(changes as any, resourceId);
              return result;
            } else if (event === 'make:change:edges') {
              const result = handleEdgeChange(changes as any);
              return result;
            } else if (event === 'make:change:connections') {
              const result = handleConnectionChange(changes as any);
              return result;
            } else {
              return;
            }
          },
        },
      }),
    },
  });
}
