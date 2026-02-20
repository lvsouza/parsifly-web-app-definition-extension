import { defineExtension } from 'parsifly-extension-base';

import { createGlobalDataTypeCompletionsDescriptor } from './completions/globalDataTypes';
import { createDefinition, getHasAcceptableProject } from './definition';
import { registerFieldsDescriptors } from './fields-descriptors';
import { createProblemsPanelView } from './problems-panel-view';
import { registerDiagnosticAnalyzers } from './diagnostics';
import { createResourcesView } from './resources-view';
import { createUIEditor } from './editors/UIEditor';
import { createInspectorView } from './inspector';


defineExtension({
  name: 'Web App',
  description: 'Define how to create a web app',
  async onDidActivate(context) {
    const webAppProjectDefinition = createDefinition(context);

    context.projects.register(webAppProjectDefinition);

    const hasAcceptableProject = await getHasAcceptableProject(context)
    if (!hasAcceptableProject) return () => {
      context.projects.unregister(webAppProjectDefinition);
    };

    /* 
      TODO:
 
      Analisar se o projeto é compatível com essa versão de projeto,
      se não for analisar se é possível migrar a versão do projeto para a nova versão da definition da plataforma.
 
      Se não for. Indicar qual versão da extensão pode ser utilizada. Ou algo assim.
    */

    const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(context);
    const problemsPanelView = createProblemsPanelView(context);
    const resourcesView = createResourcesView(context);
    const inspectorView = createInspectorView(context);
    const uiEditor = createUIEditor(context);


    const unregisterDiagnosticAnalyzers = await registerDiagnosticAnalyzers(context);
    const unregisterFieldsDescriptors = registerFieldsDescriptors(context);

    context.completions.register(globalDataTypeCompletionsDescriptor);

    await context.views.register(problemsPanelView);
    await context.views.register(resourcesView);
    await context.views.register(inspectorView);
    await context.views.register(uiEditor);

    const openedResourcesView = await context.views.open({ key: resourcesView.key });
    const openedInspectorView = await context.views.open({ key: inspectorView.key });


    return async () => {
      openedResourcesView.close();
      openedInspectorView.close();

      unregisterFieldsDescriptors();
      unregisterDiagnosticAnalyzers();

      context.completions.unregister(globalDataTypeCompletionsDescriptor);
      context.views.unregister(problemsPanelView);
      context.views.unregister(resourcesView);
      context.views.unregister(inspectorView);
      context.views.unregister(uiEditor);

      context.projects.unregister(webAppProjectDefinition);
    };
  },
});
