import { ExtensionBase } from 'parsifly-extension-base';

import { createProjectFieldsDescriptor } from './fields-descriptors/ProjectFieldsDescriptor';
import { createFolderFieldsDescriptor } from './fields-descriptors/FolderFieldsDescriptor';
import { createPageFieldsDescriptor } from './fields-descriptors/PageFieldsDescriptor';
import { createDefinition, getHasAcceptableProject } from './definition';
import { createResourcesView } from './resources-view';
import { createInspectorView } from './inspector';


new class Extension extends ExtensionBase {
  definition = createDefinition(this.application);
  resourcesView = createResourcesView(this.application);
  inspectorView = createInspectorView(this.application);

  projectFieldsDescriptor = createProjectFieldsDescriptor(this.application);
  folderFieldsDescriptor = createFolderFieldsDescriptor(this.application);
  pageFieldsDescriptor = createPageFieldsDescriptor(this.application);


  async activate() {
    this.application.projects.register(this.definition);

    const hasAcceptableProject = await getHasAcceptableProject()
    if (!hasAcceptableProject) return;

    this.application.views.register(this.resourcesView);
    this.application.views.register(this.inspectorView);
    this.application.fields.register(this.projectFieldsDescriptor);
    this.application.fields.register(this.folderFieldsDescriptor);
    this.application.fields.register(this.pageFieldsDescriptor);

    await this.application.views.showPrimarySideBarByKey(this.resourcesView.key);
    await this.application.views.showSecondarySideBarByKey(this.inspectorView.key);
  }

  async deactivate() {
    this.application.projects.unregister(this.definition);
    this.application.views.unregister(this.resourcesView);
    this.application.views.unregister(this.inspectorView);
    this.application.fields.unregister(this.projectFieldsDescriptor);
    this.application.fields.unregister(this.folderFieldsDescriptor);
    this.application.fields.unregister(this.pageFieldsDescriptor);
  }
};
