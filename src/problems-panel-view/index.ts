import { ViewContentList, ListViewItem, TExtensionContext, TSerializableDiagnosticViewItem, View } from 'parsifly-extension-base'


export const createProblemsPanelView = (extensionContext: TExtensionContext) => {

  return new View({
    key: 'web-app-problems',
    initialValue: {
      order: 1,
      title: 'Problems',
      position: 'panel',
      icon: { name: 'warning' },
      description: 'All Web extensionContext problems',
      allowedPositions: ['primary', 'secondary', 'panel'],
      viewContent: new ViewContentList({
        key: 'list-all-web-app-diagnostics',
        initialValue: {
          getItems: async () => {
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
        },
        onDidMount: async (context) => {
          const unsubscribe = extensionContext.diagnostics.subscribe(() => context.refetch());

          return async () => unsubscribe();
        },
      }),
    },
    onRequestOpen: async () => {
      await extensionContext.views.open({
        key: 'web-app-problems'
      });
    },
  });
}
