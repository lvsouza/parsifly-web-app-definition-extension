import { TExtensionContext } from 'parsifly-extension-base';

import { createExternalComponentEventParameterFieldsDescriptor } from './external/externalComponentEventParameter';
import { createExternalComponentParameterFieldsDescriptor } from './external/externalComponentParameter';
import { createStructurePropertyFieldsDescriptor } from './structure/StructurePropertyFieldsDescriptor';
import { createProjectActionParameterFieldsDescriptor } from './project-action/projectActionParameter';
import { createProjectActionVariableFieldsDescriptor } from './project-action/projectActionVariable';
import { createProjectEventParameterFieldsDescriptor } from './project-event/projectEventParameter';
import { createExternalActionParameterFieldsDescriptor } from './external/externalActionParameter';
import { createProjectActionOutputFieldsDescriptor } from './project-action/projectActionOutput';
import { createExternalComponentEventFieldsDescriptor } from './external/externalComponentEvent';
import { createExternalEventParameterFieldsDescriptor } from './external/externalEventParameter';
import { createExternalComponentSlotFieldsDescriptor } from './external/externalComponentSlot';
import { createExternalActionOutputFieldsDescriptor } from './external/externalActionOutput';
import { createProjectListenerFieldsDescriptor } from './project-listener/projectListener';
import { createProjectVariableFieldsDescriptor } from './project-variable/projectVariable';
import { createEnumPropertyFieldsDescriptor } from './enum/EnumPropertyFieldsDescriptor';
import { createStructureFieldsDescriptor } from './structure/StructureFieldsDescriptor';
import { createExternalComponentFieldsDescriptor } from './external/externalComponent';
import { createExternalVariableFieldsDescriptor } from './external/externalVariable';
import { createProjectActionFieldsDescriptor } from './project-action/projectAction';
import { createEnumValueFieldsDescriptor } from './enum/EnumValueFieldsDescriptor';
import { createProjectEventFieldsDescriptor } from './project-event/projectEvent';
import { createExternalActionFieldsDescriptor } from './external/externalAction';
import { createExternalEventFieldsDescriptor } from './external/externalEvent';
import { createProjectFieldsDescriptor } from './ProjectFieldsDescriptor';
import { createEnumFieldsDescriptor } from './enum/EnumFieldsDescriptor';
import { createFolderFieldsDescriptor } from './FolderFieldsDescriptor';
import { createExternalFieldsDescriptor } from './external/external';

import { createComponentActionParameterFieldsDescriptor } from './component/componentActionParameter';
import { createComponentEventParameterFieldsDescriptor } from './component/componentEventParameter';
import { createComponentActionVariableFieldsDescriptor } from './component/componentActionVariable';
import { createComponentActionOutputFieldsDescriptor } from './component/componentActionOutput';
import { createComponentParameterFieldsDescriptor } from './component/componentParameter';
import { createComponentVariableFieldsDescriptor } from './component/componentVariable';
import { createComponentListenerFieldsDescriptor } from './component/componentListener';
import { createComponentActionFieldsDescriptor } from './component/componentAction';
import { createComponentEventFieldsDescriptor } from './component/componentEvent';
import { createComponentFieldsDescriptor } from './component/component';

import { createPageActionParameterFieldsDescriptor } from './page/pageActionParameter';
import { createPageActionVariableFieldsDescriptor } from './page/pageActionVariable';
import { createPageActionOutputFieldsDescriptor } from './page/pageActionOutput';
import { createPageParameterFieldsDescriptor } from './page/pageParameter';
import { createPageVariableFieldsDescriptor } from './page/pageVariable';
import { createPageListenerFieldsDescriptor } from './page/pageListener';
import { createPageActionFieldsDescriptor } from './page/pageAction';
import { createPageFieldsDescriptor } from './page/page';


export const registerFieldsDescriptors = (extensionContext: TExtensionContext) => {
  const externalComponentEventParameterFieldsDescriptor = createExternalComponentEventParameterFieldsDescriptor(extensionContext);
  const externalComponentParameterFieldsDescriptor = createExternalComponentParameterFieldsDescriptor(extensionContext);
  const externalActionParameterFieldsDescriptor = createExternalActionParameterFieldsDescriptor(extensionContext);
  const externalEventParameterFieldsDescriptor = createExternalEventParameterFieldsDescriptor(extensionContext);
  const externalComponentEventFieldsDescriptor = createExternalComponentEventFieldsDescriptor(extensionContext);
  const externalComponentSlotFieldsDescriptor = createExternalComponentSlotFieldsDescriptor(extensionContext);
  const externalActionOutputFieldsDescriptor = createExternalActionOutputFieldsDescriptor(extensionContext);
  const externalComponentFieldsDescriptor = createExternalComponentFieldsDescriptor(extensionContext);
  const externalVariableFieldsDescriptor = createExternalVariableFieldsDescriptor(extensionContext);
  const externalActionFieldsDescriptor = createExternalActionFieldsDescriptor(extensionContext);
  const externalEventFieldsDescriptor = createExternalEventFieldsDescriptor(extensionContext);
  const externalFieldsDescriptor = createExternalFieldsDescriptor(extensionContext);

  const componentActionParameterFieldsDescriptor = createComponentActionParameterFieldsDescriptor(extensionContext);
  const componentEventParameterFieldsDescriptor = createComponentEventParameterFieldsDescriptor(extensionContext);
  const componentActionVariableFieldsDescriptor = createComponentActionVariableFieldsDescriptor(extensionContext);
  const componentActionOutputFieldsDescriptor = createComponentActionOutputFieldsDescriptor(extensionContext);
  const componentParameterFieldsDescriptor = createComponentParameterFieldsDescriptor(extensionContext);
  const componentVariableFieldsDescriptor = createComponentVariableFieldsDescriptor(extensionContext);
  const componentListenerFieldsDescriptor = createComponentListenerFieldsDescriptor(extensionContext);
  const componentActionFieldsDescriptor = createComponentActionFieldsDescriptor(extensionContext);
  const componentEventFieldsDescriptor = createComponentEventFieldsDescriptor(extensionContext);
  const componentFieldsDescriptor = createComponentFieldsDescriptor(extensionContext);

  const pageActionParameterFieldsDescriptor = createPageActionParameterFieldsDescriptor(extensionContext);
  const pageActionVariableFieldsDescriptor = createPageActionVariableFieldsDescriptor(extensionContext);
  const pageActionOutputFieldsDescriptor = createPageActionOutputFieldsDescriptor(extensionContext);
  const pageParameterFieldsDescriptor = createPageParameterFieldsDescriptor(extensionContext);
  const pageVariableFieldsDescriptor = createPageVariableFieldsDescriptor(extensionContext);
  const pageListenerFieldsDescriptor = createPageListenerFieldsDescriptor(extensionContext);
  const pageActionFieldsDescriptor = createPageActionFieldsDescriptor(extensionContext);
  const pageFieldsDescriptor = createPageFieldsDescriptor(extensionContext);

  const projectActionParameterFieldsDescriptor = createProjectActionParameterFieldsDescriptor(extensionContext);
  const projectActionVariableFieldsDescriptor = createProjectActionVariableFieldsDescriptor(extensionContext);
  const projectEventParameterFieldsDescriptor = createProjectEventParameterFieldsDescriptor(extensionContext);
  const projectActionOutputFieldsDescriptor = createProjectActionOutputFieldsDescriptor(extensionContext);
  const structurePropertyFieldsDescriptor = createStructurePropertyFieldsDescriptor(extensionContext);
  const projectVariableFieldsDescriptor = createProjectVariableFieldsDescriptor(extensionContext);
  const projectListenerFieldsDescriptor = createProjectListenerFieldsDescriptor(extensionContext);
  const projectActionFieldsDescriptor = createProjectActionFieldsDescriptor(extensionContext);
  const enumPropertyFieldsDescriptor = createEnumPropertyFieldsDescriptor(extensionContext);
  const projectEventFieldsDescriptor = createProjectEventFieldsDescriptor(extensionContext);
  const enumValueFieldsDescriptor = createEnumValueFieldsDescriptor(extensionContext);
  const structureFieldsDescriptor = createStructureFieldsDescriptor(extensionContext);
  const projectFieldsDescriptor = createProjectFieldsDescriptor(extensionContext);
  const folderFieldsDescriptor = createFolderFieldsDescriptor(extensionContext);
  const enumFieldsDescriptor = createEnumFieldsDescriptor(extensionContext);

  extensionContext.fields.register(externalComponentEventParameterFieldsDescriptor);
  extensionContext.fields.register(externalComponentParameterFieldsDescriptor);
  extensionContext.fields.register(externalActionParameterFieldsDescriptor);
  extensionContext.fields.register(externalComponentEventFieldsDescriptor);
  extensionContext.fields.register(externalEventParameterFieldsDescriptor);
  extensionContext.fields.register(externalComponentSlotFieldsDescriptor);
  extensionContext.fields.register(externalActionOutputFieldsDescriptor);
  extensionContext.fields.register(externalComponentFieldsDescriptor);
  extensionContext.fields.register(externalVariableFieldsDescriptor);
  extensionContext.fields.register(externalActionFieldsDescriptor);
  extensionContext.fields.register(externalEventFieldsDescriptor);
  extensionContext.fields.register(externalFieldsDescriptor);

  extensionContext.fields.register(componentActionParameterFieldsDescriptor);
  extensionContext.fields.register(componentEventParameterFieldsDescriptor);
  extensionContext.fields.register(componentActionVariableFieldsDescriptor);
  extensionContext.fields.register(componentActionOutputFieldsDescriptor);
  extensionContext.fields.register(componentParameterFieldsDescriptor);
  extensionContext.fields.register(componentVariableFieldsDescriptor);
  extensionContext.fields.register(componentListenerFieldsDescriptor);
  extensionContext.fields.register(componentActionFieldsDescriptor);
  extensionContext.fields.register(componentEventFieldsDescriptor);
  extensionContext.fields.register(componentFieldsDescriptor);

  extensionContext.fields.register(pageActionParameterFieldsDescriptor);
  extensionContext.fields.register(pageActionVariableFieldsDescriptor);
  extensionContext.fields.register(pageActionOutputFieldsDescriptor);
  extensionContext.fields.register(pageParameterFieldsDescriptor);
  extensionContext.fields.register(pageVariableFieldsDescriptor);
  extensionContext.fields.register(pageListenerFieldsDescriptor);
  extensionContext.fields.register(pageActionFieldsDescriptor);
  extensionContext.fields.register(pageFieldsDescriptor);

  extensionContext.fields.register(projectActionParameterFieldsDescriptor);
  extensionContext.fields.register(projectActionVariableFieldsDescriptor);
  extensionContext.fields.register(projectEventParameterFieldsDescriptor);
  extensionContext.fields.register(projectActionOutputFieldsDescriptor);
  extensionContext.fields.register(structurePropertyFieldsDescriptor);
  extensionContext.fields.register(projectListenerFieldsDescriptor);
  extensionContext.fields.register(projectVariableFieldsDescriptor);
  extensionContext.fields.register(projectActionFieldsDescriptor);
  extensionContext.fields.register(projectEventFieldsDescriptor);
  extensionContext.fields.register(enumPropertyFieldsDescriptor);
  extensionContext.fields.register(structureFieldsDescriptor);
  extensionContext.fields.register(enumValueFieldsDescriptor);
  extensionContext.fields.register(projectFieldsDescriptor);
  extensionContext.fields.register(folderFieldsDescriptor);
  extensionContext.fields.register(enumFieldsDescriptor);

  return () => {
    extensionContext.fields.unregister(externalComponentEventParameterFieldsDescriptor);
    extensionContext.fields.unregister(externalComponentParameterFieldsDescriptor);
    extensionContext.fields.unregister(externalActionParameterFieldsDescriptor);
    extensionContext.fields.unregister(externalComponentEventFieldsDescriptor);
    extensionContext.fields.unregister(externalEventParameterFieldsDescriptor);
    extensionContext.fields.unregister(externalComponentSlotFieldsDescriptor);
    extensionContext.fields.unregister(externalActionOutputFieldsDescriptor)
    extensionContext.fields.unregister(externalComponentFieldsDescriptor);
    extensionContext.fields.unregister(externalVariableFieldsDescriptor);
    extensionContext.fields.unregister(externalActionFieldsDescriptor);
    extensionContext.fields.unregister(externalEventFieldsDescriptor);
    extensionContext.fields.unregister(externalFieldsDescriptor);

    extensionContext.fields.unregister(componentActionParameterFieldsDescriptor);
    extensionContext.fields.unregister(componentActionVariableFieldsDescriptor);
    extensionContext.fields.unregister(componentEventParameterFieldsDescriptor);
    extensionContext.fields.unregister(componentActionOutputFieldsDescriptor);
    extensionContext.fields.unregister(componentParameterFieldsDescriptor);
    extensionContext.fields.unregister(componentListenerFieldsDescriptor);
    extensionContext.fields.unregister(componentVariableFieldsDescriptor);
    extensionContext.fields.unregister(componentActionFieldsDescriptor);
    extensionContext.fields.unregister(componentEventFieldsDescriptor);
    extensionContext.fields.unregister(componentFieldsDescriptor);

    extensionContext.fields.unregister(pageActionParameterFieldsDescriptor);
    extensionContext.fields.unregister(pageActionVariableFieldsDescriptor);
    extensionContext.fields.unregister(pageActionOutputFieldsDescriptor);
    extensionContext.fields.unregister(pageParameterFieldsDescriptor);
    extensionContext.fields.unregister(pageListenerFieldsDescriptor);
    extensionContext.fields.unregister(pageVariableFieldsDescriptor);
    extensionContext.fields.unregister(pageActionFieldsDescriptor);
    extensionContext.fields.unregister(pageFieldsDescriptor);

    extensionContext.fields.unregister(projectActionParameterFieldsDescriptor);
    extensionContext.fields.unregister(projectActionVariableFieldsDescriptor);
    extensionContext.fields.unregister(projectEventParameterFieldsDescriptor);
    extensionContext.fields.unregister(projectActionOutputFieldsDescriptor);
    extensionContext.fields.unregister(structurePropertyFieldsDescriptor);
    extensionContext.fields.unregister(projectVariableFieldsDescriptor);
    extensionContext.fields.unregister(projectListenerFieldsDescriptor);
    extensionContext.fields.unregister(projectActionFieldsDescriptor);
    extensionContext.fields.unregister(projectEventFieldsDescriptor);
    extensionContext.fields.unregister(enumPropertyFieldsDescriptor);
    extensionContext.fields.unregister(structureFieldsDescriptor);
    extensionContext.fields.unregister(enumValueFieldsDescriptor);
    extensionContext.fields.unregister(projectFieldsDescriptor);
    extensionContext.fields.unregister(folderFieldsDescriptor);
    extensionContext.fields.unregister(enumFieldsDescriptor);
  }
}
