import { ExtensionBase } from 'parsifly-extension-base';

import { createResourcesView } from './resources-view';
import { createDefinition } from './definition';


new class Extension extends ExtensionBase {
  definition = createDefinition(this.application);
  resourcesView = createResourcesView(this.application);


  async activate() {
    this.application.projects.register(this.definition);
    this.application.views.register(this.resourcesView);

    await this.application.views.showPrimarySideBarByKey(this.resourcesView.key);
  }

  async deactivate() {
    this.application.projects.unregister(this.definition);
    this.application.views.unregister(this.resourcesView);
  }
};
