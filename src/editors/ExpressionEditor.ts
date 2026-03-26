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
        width: 700,
        height: 500,
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
          onDidMessage: async (_webViewContext, event, value) => {
            console.log(event, value);

            if (typeof context.customData !== 'object') return;
            if (value === null || value === undefined) return;
            if (event !== 'change') return;
          },
        },
        onDidMount: async (webViewContext) => {
          console.log(context.customData);

          if (typeof context.customData !== 'object') return;

          await webViewContext.sendMessage('value', context.customData);
        },
      }),
    },
  });
}
