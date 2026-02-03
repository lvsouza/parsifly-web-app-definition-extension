import { defineExtension } from 'parsifly-extension-base';

import { createGlobalEnumAndStructureNamesDiagnosticsAnalyzer } from './diagnostics/enum-and-structure-names';
import { createStatusBarProblemsIndicator } from './diagnostics/StatusBarProblemsIndicator';
import { createGlobalDataTypeCompletionsDescriptor } from './completions/global-data-types';
import { createFolderNamesDiagnosticsAnalyzer } from './diagnostics/folder-names';
import { createDefinition, getHasAcceptableProject } from './definition';
import { createProblemsPanelView } from './problems-panel-view';
import { createFieldsDescriptors } from './fields-descriptors';
import { createResourcesView } from './resources-view';
import { createUIEditor } from './editors/UIEditor';
import { createInspectorView } from './inspector';


defineExtension({
  name: 'Web App',
  description: 'Define how to create a web app',
  async onDidActivate(context) {
    const webAppProjectDefinition = createDefinition(context);
    const problemsPanelView = createProblemsPanelView(context);
    const resourcesView = createResourcesView(context);
    const inspectorView = createInspectorView(context);
    const uiEditor = createUIEditor(context);
    const globalEnumAndStructureNamesDiagnosticsAnalyzer = createGlobalEnumAndStructureNamesDiagnosticsAnalyzer(context);
    const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(context);
    const folderNamesDiagnosticsAnalyzer = createFolderNamesDiagnosticsAnalyzer(context);
    const diagnosticsIndicator = createStatusBarProblemsIndicator(context);
    const fieldsDescriptors = createFieldsDescriptors(context);


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


    context.completions.register(globalDataTypeCompletionsDescriptor);
    await context.diagnostics.register(globalEnumAndStructureNamesDiagnosticsAnalyzer);
    await context.diagnostics.register(folderNamesDiagnosticsAnalyzer);

    await context.statusBarItems.register(diagnosticsIndicator);
    await context.views.register(problemsPanelView);
    await context.views.register(resourcesView);
    await context.views.register(inspectorView);
    await context.views.register(uiEditor);

    const openedResourcesView = await context.views.open({ key: resourcesView.key });
    const openedInspectorView = await context.views.open({ key: inspectorView.key });


    return async () => {
      openedResourcesView.close();
      openedInspectorView.close();

      fieldsDescriptors();

      context.completions.unregister(globalDataTypeCompletionsDescriptor);
      context.statusBarItems.unregister(diagnosticsIndicator);
      context.views.unregister(problemsPanelView);
      context.views.unregister(resourcesView);
      context.views.unregister(inspectorView);
      context.views.unregister(uiEditor);

      context.diagnostics.unregister(globalEnumAndStructureNamesDiagnosticsAnalyzer);
      context.diagnostics.unregister(folderNamesDiagnosticsAnalyzer);
      context.projects.unregister(webAppProjectDefinition);
    };
  },
});
