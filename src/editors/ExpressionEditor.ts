import { View, Action, TExtensionContext, ViewContentWebView } from 'parsifly-extension-base';


export const createExpressionEditor = (_extensionContext: TExtensionContext) => {
  return new View({
    key: 'expression-editor',
    initialValue: {
      selector: [],
      allowWindow: true,
      title: "Expression Editor",
      position: 'editor',
      icon: { name: 'combine' },
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
      getViewContent: async (context) => new ViewContentWebView({
        key: 'expression-editor-view-content',
        initialValue: {
          backgroundTransparent: true,
          entryPoint: {
            file: "index.html",
            basePath: "views/expression-editor",
          },
          onDidMessage: async (webViewContext, event, value) => {
            console.log(event, value);

            if (typeof context.customData !== 'object') return;

            if (event === 'request:update:context') {
              console.log('Update context requested');
              await webViewContext.sendMessage('update:context', [
                {
                  id: 'basic-group',
                  name: 'Basic',
                  description: 'Basic nodes for expression builder',
                  options: [
                    { id: '1', name: 'Input String', icon: '/dist/string.svg', description: 'Basic string input' },
                    { id: '2', name: 'Input Number', icon: '/dist/number.svg', description: 'Basic number input' },
                    { id: '3', name: 'Input Boolean', icon: '/dist/boolean.svg', description: 'Basic boolean input' },
                    { id: '4', name: 'Input Binary', icon: '/dist/binary.svg', description: 'Basic binary input' },
                    { id: '5', name: 'Input Object', icon: '/dist/object.svg', description: 'Basic object input' },
                    { id: '6', name: 'Input Array', icon: '/dist/array.svg', description: 'Basic array input' },
                  ]
                },
                {
                  id: 'variable-group',
                  name: 'Variables',
                  description: 'Get variable node for expression builder',
                  options: [
                    { id: '1', name: 'Get variable', icon: '/dist/project-variable.svg', description: 'Get a variable' },
                    { id: '2', name: 'Get external variable', icon: '/dist/external-variable.svg', description: 'Get a external variable' },
                  ]
                },
                {
                  id: 'action-group',
                  name: 'Actions',
                  description: 'Call actions node for expression builder',
                  options: [
                    { id: '1', name: 'Call action', icon: '/dist/project-action.svg', description: 'Call a action' },
                    { id: '2', name: 'Call external action', icon: '/dist/external-action.svg', description: 'Call a external action' },
                  ]
                },
              ]);
            } else if (event === 'request:update:content') {
              console.log('Update content requested')
              await webViewContext.sendMessage('update:content', 'Content here');
            }
          },
        },
        onDidMount: async (_webViewContext) => {
          console.log(context.customData);
        },
      }),
    },
  });
}
