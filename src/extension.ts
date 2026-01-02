import { ExtensionBase } from 'parsifly-extension-base';

import { createStructureAttributeFieldsDescriptor } from './fields-descriptors/StructureAttributeFieldsDescriptor';
import { createComponentFieldsDescriptor } from './fields-descriptors/ComponentFieldsDescriptor';
import { createStructureFieldsDescriptor } from './fields-descriptors/StructureFieldsDescriptor';
import { createProjectFieldsDescriptor } from './fields-descriptors/ProjectFieldsDescriptor';
import { createActionFieldsDescriptor } from './fields-descriptors/ActionFieldsDescriptor';
import { createFolderFieldsDescriptor } from './fields-descriptors/FolderFieldsDescriptor';
import { createPageFieldsDescriptor } from './fields-descriptors/PageFieldsDescriptor';
import { createDefinition, getHasAcceptableProject } from './definition';
import { createResourcesView } from './resources-view';
import { createInspectorView } from './inspector';


new class Extension extends ExtensionBase {
  webAppProjectDefinition = createDefinition(this.application);

  resourcesView = createResourcesView(this.application);
  inspectorView = createInspectorView(this.application);

  structureAttributeFieldsDescriptor = createStructureAttributeFieldsDescriptor(this.application);
  structureFieldsDescriptor = createStructureFieldsDescriptor(this.application);
  componentFieldsDescriptor = createComponentFieldsDescriptor(this.application);
  projectFieldsDescriptor = createProjectFieldsDescriptor(this.application);
  folderFieldsDescriptor = createFolderFieldsDescriptor(this.application);
  actionFieldsDescriptor = createActionFieldsDescriptor(this.application);
  pageFieldsDescriptor = createPageFieldsDescriptor(this.application);


  async activate() {
    this.application.projects.register(this.webAppProjectDefinition);

    const hasAcceptableProject = await getHasAcceptableProject(this.application)
    if (!hasAcceptableProject) return;

    this.application.views.register(this.resourcesView);
    this.application.views.register(this.inspectorView);
    this.application.fields.register(this.structureAttributeFieldsDescriptor);
    this.application.fields.register(this.structureFieldsDescriptor);
    this.application.fields.register(this.componentFieldsDescriptor);
    this.application.fields.register(this.projectFieldsDescriptor);
    this.application.fields.register(this.actionFieldsDescriptor);
    this.application.fields.register(this.folderFieldsDescriptor);
    this.application.fields.register(this.pageFieldsDescriptor);

    await this.application.views.showPrimarySideBarByKey(this.resourcesView.key);
    await this.application.views.showSecondarySideBarByKey(this.inspectorView.key);
  }

  async deactivate() {
    this.application.projects.unregister(this.webAppProjectDefinition);
    this.application.views.unregister(this.resourcesView);
    this.application.views.unregister(this.inspectorView);
    this.application.fields.unregister(this.structureAttributeFieldsDescriptor);
    this.application.fields.unregister(this.structureFieldsDescriptor);
    this.application.fields.unregister(this.componentFieldsDescriptor);
    this.application.fields.unregister(this.projectFieldsDescriptor);
    this.application.fields.unregister(this.actionFieldsDescriptor);
    this.application.fields.unregister(this.folderFieldsDescriptor);
    this.application.fields.unregister(this.pageFieldsDescriptor);
  }
};
