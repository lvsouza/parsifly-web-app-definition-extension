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
import { createProjectListenerFieldsDescriptor } from './project-listener/projectListener';


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
