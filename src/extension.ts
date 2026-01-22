import { defineExtension } from 'parsifly-extension-base';

import { createStructureAttributeFieldsDescriptor } from './fields-descriptors/StructureAttributeFieldsDescriptor';
import { createComponentFieldsDescriptor } from './fields-descriptors/ComponentFieldsDescriptor';
import { createStructureFieldsDescriptor } from './fields-descriptors/StructureFieldsDescriptor';
import { createProjectFieldsDescriptor } from './fields-descriptors/ProjectFieldsDescriptor';
import { createStatusBarProblemsIndicator } from './diagnostics/StatusBarProblemsIndicator';
import { createGlobalDataTypeCompletionsDescriptor } from './completions/global-data-types';
import { createActionFieldsDescriptor } from './fields-descriptors/ActionFieldsDescriptor';
import { createFolderFieldsDescriptor } from './fields-descriptors/FolderFieldsDescriptor';
import { createPageFieldsDescriptor } from './fields-descriptors/PageFieldsDescriptor';
import { createFolderNamesDiagnosticsAnalyzer } from './diagnostics/folder-names';
import { createDefinition, getHasAcceptableProject } from './definition';
import { createProblemsPanelView } from './problems-panel-view';
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
    const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(context);
    const structureAttributeFieldsDescriptor = createStructureAttributeFieldsDescriptor(context);
    const structureFieldsDescriptor = createStructureFieldsDescriptor(context);
    const componentFieldsDescriptor = createComponentFieldsDescriptor(context);
    const projectFieldsDescriptor = createProjectFieldsDescriptor(context);
    const folderFieldsDescriptor = createFolderFieldsDescriptor(context);
    const actionFieldsDescriptor = createActionFieldsDescriptor(context);
    const pageFieldsDescriptor = createPageFieldsDescriptor(context);
    const folderNamesDiagnosticsAnalyzer = createFolderNamesDiagnosticsAnalyzer(context);
    const diagnosticsIndicator = createStatusBarProblemsIndicator(context);


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

    context.views.register(problemsPanelView);
    context.views.register(resourcesView);
    context.views.register(inspectorView);
    context.completions.register(globalDataTypeCompletionsDescriptor);
    context.diagnostics.register(folderNamesDiagnosticsAnalyzer);
    context.fields.register(structureAttributeFieldsDescriptor);
    context.fields.register(structureFieldsDescriptor);
    context.fields.register(componentFieldsDescriptor);
    context.fields.register(projectFieldsDescriptor);
    context.fields.register(actionFieldsDescriptor);
    context.fields.register(folderFieldsDescriptor);
    context.fields.register(pageFieldsDescriptor);
    context.views.register(uiEditor);
    context.statusBarItems.register(diagnosticsIndicator);

    await context.views.showPrimarySideBarByKey(resourcesView.key);
    await context.views.showSecondarySideBarByKey(inspectorView.key);


    return () => {
      context.projects.unregister(webAppProjectDefinition);
      context.views.unregister(problemsPanelView);
      context.views.unregister(resourcesView);
      context.views.unregister(inspectorView);
      context.completions.unregister(globalDataTypeCompletionsDescriptor);
      context.diagnostics.unregister(folderNamesDiagnosticsAnalyzer);
      context.fields.unregister(structureAttributeFieldsDescriptor);
      context.fields.unregister(structureFieldsDescriptor);
      context.fields.unregister(componentFieldsDescriptor);
      context.fields.unregister(projectFieldsDescriptor);
      context.fields.unregister(actionFieldsDescriptor);
      context.fields.unregister(folderFieldsDescriptor);
      context.fields.unregister(pageFieldsDescriptor);
      context.views.unregister(uiEditor);
      context.statusBarItems.unregister(diagnosticsIndicator);
    };
  },
});
