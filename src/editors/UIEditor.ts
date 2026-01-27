import { View, Action, TExtensionContext, ViewContentWebView } from 'parsifly-extension-base';


export const createUIEditor = (_extensionContext: TExtensionContext) => {
  return new View({
    key: 'ui-editor',
    initialValue: {
      allowWindow: true,
      title: "UI Editor",
      position: 'editor',
      icon: { name: 'inspect' },
      selector: ['page', 'component'],
      description: "This editor allow you to edit the components or pages ui content",
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
          new Action({
            key: 'more-options',
            initialValue: {
              children: true,
              label: "More options",
              icon: { name: "ellipsis" },
              getActions: async () => {
                return [
                  new Action({
                    key: 'more-send-message',
                    initialValue: {
                      label: "Send message",
                      icon: { name: "send" },
                      action: async () => {
                        //const editionId = await extensionContext.edition.get();
                        //await context.sendMessage('From extension host (sendMessage)', editionId);
                      },
                    },
                  }),
                  new Action({
                    key: 'more-close-editor',
                    initialValue: {
                      label: "Close editor",
                      icon: { name: "close" },
                      action: async () => {
                        await context.close();
                      },
                    },
                  }),
                ];
              },
            },
          }),
        ];
      },
      viewContent: new ViewContentWebView({
        key: 'ui-editor-view-content',
        initialValue: {
          entryPoint: {
            file: "index.html",
            basePath: "views/ui-editor",
          },
          onDidMessage: async (_context, value) => {
            console.log('Extension Host:', value);
          },
        },
        onDidMount: async (context) => {
          await context.sendMessage('From extension host (onDidMount)');

          return async () => {
            console.log('editor unmounted')
          };
        }
      }),
    },
    onDidMount: async (context) => {
      console.log('Editor recebeu os dados', context.customData);
    },
  });
}
