import { StatusBarItem, TExtensionContext, TSerializableDiagnosticViewItem } from 'parsifly-extension-base';


export const createStatusBarProblemsIndicator = (extensionContext: TExtensionContext) => {
  let _diagnostics: Record<string, TSerializableDiagnosticViewItem[]> = {};

  return new StatusBarItem({
    key: 'diagnostic-indicator-status-bar-item',
    initialValue: {
      side: 'left',
      label: '0 errors, 0 warnings',
      description: 'Click here to go to the first error or warning',
      action: async () => {
        const diagnostic = Object
          .entries(_diagnostics)
          .flatMap(([, diagnostics]) => diagnostics)
          .sort((a, b) =>
            (a.severity === 'error' ? 0 : a.severity === 'warning' ? 1 : 2) -
            (b.severity === 'error' ? 0 : b.severity === 'warning' ? 1 : 2)
          )
          .at(0);

        if (!diagnostic?.target.resourceId) return;

        await extensionContext.selection.select(diagnostic.target.resourceId);
      },
    },
    onDidMount: async (context) => {
      _diagnostics = await extensionContext.diagnostics.get();

      const unsubscribe = extensionContext.diagnostics.subscribe(async (diagnostics) => {
        _diagnostics = diagnostics;

        const { errors, warnings } = Object.entries(_diagnostics).reduce((previous, [, current]) => {
          previous.errors = previous.errors + current.filter(diagnostic => diagnostic.severity === 'error').length;
          previous.warnings = previous.warnings + current.filter(diagnostic => diagnostic.severity === 'warning').length;
          return previous;
        }, { errors: 0, warnings: 0 });

        const errorsText = errors === 1 ? '1 error' : `${errors} errors`;
        const warningsText = warnings === 1 ? '1 warning' : `${warnings} warnings`;

        await context.set('label', `${errorsText}, ${warningsText}`);
      });

      return () => unsubscribe();
    },
  });
}
