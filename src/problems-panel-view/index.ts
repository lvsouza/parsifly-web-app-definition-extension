import { ListProvider, ListViewItem, TExtensionContext, TSerializableDiagnosticViewItem, View } from 'parsifly-extension-base'


export const createProblemsPanelView = (extensionContext: TExtensionContext) => {

  return new View({
    key: 'web-app-problems',
    initialValue: {
      title: 'Problems',
      position: 'primary',
      icon: { name: 'warning' },
      description: 'All Web extensionContext problems',
      dataProvider: new ListProvider({
        key: 'list-all-web-app-diagnostics',
        getItems: async () => {

          console.log('list problems')

          const problems = await extensionContext
            .diagnostics
            .get()
            .then(result => (
              Object.entries(result).reduce((previous: TSerializableDiagnosticViewItem[], [, currentProblems]) => {
                return [...previous, ...currentProblems];
              }, [])
            ));


          return problems.map(problem => (
            new ListViewItem({
              key: `${problem.key}-${problem.severity}-${problem.target.resourceId}-${problem.target.resourceType}-${problem.target.property || 'default'}`,
              initialValue: {
                disableSelect: true,
                label: problem.message,
                description: problem.documentation?.summary,
                icon: { name: problem.severity === 'error' ? 'error' : problem.severity === 'warning' ? 'warning' : 'info' },
                onItemClick: async () => {
                  await extensionContext.selection.select(problem.target.resourceId);
                },
              }
            })
          ));
        },
      }),
    },
    onDidMount: async (context) => {
      const unsubscribe = extensionContext.diagnostics.subscribe(() => context.refetchData());

      return async () => unsubscribe();
    },
  });
}
