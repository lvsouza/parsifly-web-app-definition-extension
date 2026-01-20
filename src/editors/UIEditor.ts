import { Editor, Action, TExtensionContext } from 'parsifly-extension-base';


export const createUIEditor = (extensionContext: TExtensionContext) => {
  return new Editor({
    key: 'ui-editor',
    initialValue: {
      title: "UI Editor",
      position: 'center',
      icon: { name: 'inspect' },
      selector: ['page', 'component'],
      description: "This editor allow you to edit the components or pages ui content",
      entryPoint: {
        file: "index.html",
        basePath: "views/ui-editor",
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
                await context.reload();
              },
            },
          }),
          new Action({
            key: 'close-editor',
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
                        const editionId = await extensionContext.edition.get();
                        const result = await context.sendMessage('From extension host', editionId);
                        console.log('Extension host result', result);
                      },
                    },
                  }),
                  new Action({
                    key: 'more-close-editor',
                    initialValue: {
                      label: "Close editor",
                      icon: { name: "close" },
                      action: async () => {
                        const editionId = await extensionContext.edition.get();
                        await extensionContext.edition.close(editionId);
                      },
                    },
                  }),
                ];
              },
            },
          }),
        ];
      },
      onDidMessage: async (context, value) => {
        console.log('Extension Host:', context, value);
      },
    },
    onDidMount: async (context) => {
      const editionId = await extensionContext.edition.get();
      const result = await context.sendMessage('From extension host', editionId);
      console.log('result-result', result);

      return async () => {
        console.log('editor unmounted')
      };
    },
  })
}
