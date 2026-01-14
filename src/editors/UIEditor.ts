import { Editor, PlatformAction, TApplication } from 'parsifly-extension-base';


export const createUIEditor = (application: TApplication) => {
  return new Editor({
    key: 'ui-editor',
    initialValue: {
      title: "UI Editor",
      position: 'center',
      icon: { name: 'VscInspect' },
      selector: ['page', 'component'],
      description: "This editor allow you to edit the components or pages ui content",
      entryPoint: {
        file: "index.html",
        basePath: "views/ui-editor",
      },
      getActions: async (context) => {
        return [
          new PlatformAction({
            key: 'reload',
            initialValue: {
              label: "Reload editor",
              icon: { name: "VscRefresh" },
              description: "Reload editor",
              action: async () => {
                await context.reload();
              },
            },
          }),
          new PlatformAction({
            key: 'close-editor',
            initialValue: {
              children: true,
              label: "More options",
              icon: { name: "VscEllipsis" },
              getActions: async () => {
                return [
                  new PlatformAction({
                    key: 'more-send-message',
                    initialValue: {
                      label: "Send message",
                      icon: { name: "VscSend" },
                      action: async () => {
                        const editionId = await application.edition.get();
                        const result = await context.sendMessage('From extension host', editionId);
                        console.log('Extension host result', result);
                      },
                    },
                  }),
                  new PlatformAction({
                    key: 'more-close-editor',
                    initialValue: {
                      label: "Close editor",
                      icon: { name: "VscClose" },
                      action: async () => {
                        const editionId = await application.edition.get();
                        await application.edition.close(editionId);
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
      console.log('editor mounted')

      const editionId = await application.edition.get();
      const result = await context.sendMessage('From extension host', editionId);
      console.log('result-result', result);

      context.onDidUnmount(async () => {
        console.log('editor unmounted')
      });
    },
  })
}
