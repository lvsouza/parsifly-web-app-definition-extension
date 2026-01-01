import { FormProvider, TApplication, View } from 'parsifly-extension-base';


export const createInspectorView = (application: TApplication) => {
  return new View({
    key: 'web-app-inspector',
    initialValue: {
      title: 'Inspector',
      position: 'secondary',
      icon: { name: 'VscEdit' },
      description: 'Web app properties',
      dataProvider: new FormProvider({
        key: 'web-app-inspector-fields',
        getFields: async () => {
          const [selectionId] = await application.selection.get();
          return await application.fields.get(selectionId);
        },
      }),
    },
    onDidMount: async (context) => {
      const unsubscribe = application.selection.subscribe(() => context.refetchData());

      context.onDidUnmount(async () => {
        unsubscribe();
      });
    },
  });
}
