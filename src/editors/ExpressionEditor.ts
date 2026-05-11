import { View, Action, TExtensionContext, ViewContentWebView } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { expressionNode } from '../definition/schema';


export const createExpressionEditor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleLoadExpressionContent = async () => {
    const initialNodes = [
      {
        id: 'src-string',
        type: 'inputString',
        position: { x: 50, y: 50 },
        data: {
          value: 'Olá mundo',
          handleId: 'string-out',
        },
      },
      {
        id: 'out-1',
        type: 'outputResult',
        position: { x: 450, y: 50 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
      {
        id: 'src-number',
        type: 'inputNumber',
        position: { x: 50, y: 200 },
        data: {
          value: 42,
          handleId: 'number-out',
        },
      },
      {
        id: 'out-2',
        type: 'outputResult',
        position: { x: 450, y: 200 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
      {
        id: 'src-boolean',
        type: 'inputBoolean',
        position: { x: 50, y: 350 },
        data: {
          value: true,
          handleId: 'boolean-out',
        },
      },
      {
        id: 'out-3',
        type: 'outputResult',
        position: { x: 450, y: 350 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
      {
        id: 'src-binary',
        type: 'inputBinary',
        position: { x: 50, y: 500 },
        data: {
          handleId: 'binary-out',
        },
      },
      {
        id: 'out-4',
        type: 'outputResult',
        position: { x: 450, y: 500 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
      {
        id: 'src-variable',
        type: 'inputGetVariable',
        position: { x: 50, y: 650 },
        data: {
          handleId: 'variable-out',
          variable: 'SessionToken',
        },
      },
      {
        id: 'out-5',
        type: 'outputResult',
        position: { x: 450, y: 650 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
      {
        id: 'src-action',
        type: 'inputCallAction',
        position: { x: 50, y: 800 },
        data: {
          action: 'FetchUser',
          parameters: [
            {
              id: 'user-id',
              name: 'UserId',
            }
          ],
          outputs: [
            {
              id: 'user-data-out',
              name: 'UserData'
            },
            {
              id: 'error-out',
              name: 'Error'
            },
          ],
        },
      },
      {
        id: 'out-6',
        type: 'outputResult',
        position: { x: 450, y: 800 },
        data: {
          label: 'Output',
          name: 'Parameter',
          handleId: 'result-in',
        },
      },
    ];

    const initialEdges = [
      {
        id: 'e-string',
        source: 'src-string',
        target: 'out-1',
        sourceHandle: 'string-out',
        targetHandle: 'result-in',
      },
      {
        id: 'e-number',
        source: 'src-number',
        target: 'out-2',
        sourceHandle: 'number-out',
        targetHandle: 'result-in',
      },
      {
        id: 'e-boolean',
        source: 'src-boolean',
        target: 'out-3',
        sourceHandle: 'boolean-out',
        targetHandle: 'result-in',
      },
      {
        id: 'e-binary',
        source: 'src-binary',
        target: 'out-4',
        sourceHandle: 'binary-out',
        targetHandle: 'result-in',
      },
      {
        id: 'e-variable',
        source: 'src-variable',
        target: 'out-5',
        sourceHandle: 'variable-out',
        targetHandle: 'result-in',
      },
      {
        id: 'e-action',
        source: 'src-action',
        target: 'out-6',
        sourceHandle: 'user-data-out',
        targetHandle: 'result-in',
      },
    ];

    const nodes = await databaseHelper
      .select({
        id: expressionNode.id,
        name: expressionNode.name,
        type: expressionNode.type,
        nodeType: expressionNode.nodeType,
      })
      .from(expressionNode)

    console.log(nodes)

    return {
      nodes: initialNodes,
      edges: initialEdges,
    };
  }

  type TResource = { key: string; type: string; property: string; }
  const handleLoadExpressionContext = async ({ key, type, property }: TResource) => {
    console.log(key, type, property)

    const actions = await extensionContext.completions.get({
      kind: 'callable',
      visibility: { key, type },
    });
    const variables = await extensionContext.completions.get({
      kind: 'reference',
      visibility: { key, type },
    });

    return {
      options: [
        {
          id: 'basic-group',
          name: 'Basic',
          description: 'Basic nodes for expression builder',
          options: [
            { id: '1', name: 'String', icon: '/dist/string.svg', description: 'Basic string input' },
            { id: '2', name: 'Number', icon: '/dist/number.svg', description: 'Basic number input' },
            { id: '3', name: 'Boolean', icon: '/dist/boolean.svg', description: 'Basic boolean input' },
            { id: '4', name: 'Binary', icon: '/dist/binary.svg', description: 'Basic binary input' },
            { id: '5', name: 'Object', icon: '/dist/object.svg', description: 'Basic object input' },
            { id: '6', name: 'Array', icon: '/dist/array.svg', description: 'Basic array input' },
          ],
        },
        {
          id: 'condition-group',
          name: 'Conditions',
          description: 'Get condition node for expression builder',
          options: [
            { id: '1', name: 'If', icon: '/dist/if.svg', description: 'Basic IF, receive a condition value and return one of two values' },
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
              description: action.description,
              icon: `/dist/${action.icon?.path}`,
            })),
          ],
        },
      ],
    };
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

            const { resourceId, resourceType, resourceProperty } = viewContext.customData as any;

            if (event === 'request:update:context') {
              const result = await handleLoadExpressionContext({ key: resourceId, type: resourceType, property: resourceProperty });
              await webViewContext.sendMessage('update:context', result);
            } else if (event === 'request:update:content') {
              const result = await handleLoadExpressionContent();
              await webViewContext.sendMessage('update:content', result);
            } else if (event === 'make:change:nodes') {
              console.log('nodes', changes);
            } else if (event === 'make:change:edges') {
              console.log('edges', changes);
            } else if (event === 'make:change:connections') {
              console.log('connections', changes);
            };
          },
        },
      }),
    },
  });
}
