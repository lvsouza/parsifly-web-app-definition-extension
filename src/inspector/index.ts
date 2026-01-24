import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';


export const createInspectorView = (extensionContext: TExtensionContext) => {
  return new View({
    key: 'web-app-inspector',
    initialValue: {
      order: 0,
      title: 'Inspector',
      position: 'secondary',
      icon: { name: 'edit' },
      description: 'Web app properties',
      allowedPositions: ['primary', 'secondary', 'panel'],
      viewContent: new ViewContentForm({
        key: 'web-app-inspector-fields',
        initialValue: {
          getFields: async () => {
            const [selectionId] = await extensionContext.selection.get();
            return await extensionContext.fields.get(selectionId);
          },
        },
        onDidMount: async (context) => {
          const unsubscribe = extensionContext.selection.subscribe(() => context.refetch());

          return async () => {
            unsubscribe();
          };
        },
      }),
    },
  });
}
