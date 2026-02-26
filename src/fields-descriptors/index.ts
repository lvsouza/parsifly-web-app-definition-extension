import { TExtensionContext } from 'parsifly-extension-base';

import { createStructurePropertyFieldsDescriptor } from './structure/StructurePropertyFieldsDescriptor';
import { createExternalComponentFieldsDescriptor } from './external/variable/externalComponent';
import { createExternalVariableFieldsDescriptor } from './external/variable/externalVariable';
import { createExternalActionFieldsDescriptor } from './external/variable/externalAction';
import { createEnumPropertyFieldsDescriptor } from './enum/EnumPropertyFieldsDescriptor';
import { createExternalEventFieldsDescriptor } from './external/variable/externalEvent';
import { createStructureFieldsDescriptor } from './structure/StructureFieldsDescriptor';
import { createEnumValueFieldsDescriptor } from './enum/EnumValueFieldsDescriptor';
import { createProjectFieldsDescriptor } from './ProjectFieldsDescriptor';
import { createEnumFieldsDescriptor } from './enum/EnumFieldsDescriptor';
import { createFolderFieldsDescriptor } from './FolderFieldsDescriptor';
import { createExternalFieldsDescriptor } from './external/external';


export const registerFieldsDescriptors = (extensionContext: TExtensionContext) => {
  const externalComponentFieldsDescriptor = createExternalComponentFieldsDescriptor(extensionContext);
  const externalVariableFieldsDescriptor = createExternalVariableFieldsDescriptor(extensionContext);
  const externalActionFieldsDescriptor = createExternalActionFieldsDescriptor(extensionContext);
  const externalEventFieldsDescriptor = createExternalEventFieldsDescriptor(extensionContext);
  const externalFieldsDescriptor = createExternalFieldsDescriptor(extensionContext);

  const structurePropertyFieldsDescriptor = createStructurePropertyFieldsDescriptor(extensionContext);
  const enumPropertyFieldsDescriptor = createEnumPropertyFieldsDescriptor(extensionContext);
  const enumValueFieldsDescriptor = createEnumValueFieldsDescriptor(extensionContext);
  const structureFieldsDescriptor = createStructureFieldsDescriptor(extensionContext);
  const projectFieldsDescriptor = createProjectFieldsDescriptor(extensionContext);
  const folderFieldsDescriptor = createFolderFieldsDescriptor(extensionContext);
  const enumFieldsDescriptor = createEnumFieldsDescriptor(extensionContext);

  extensionContext.fields.register(externalComponentFieldsDescriptor);
  extensionContext.fields.register(externalVariableFieldsDescriptor);
  extensionContext.fields.register(externalActionFieldsDescriptor);
  extensionContext.fields.register(externalEventFieldsDescriptor);
  extensionContext.fields.register(externalFieldsDescriptor);

  extensionContext.fields.register(structurePropertyFieldsDescriptor);
  extensionContext.fields.register(enumPropertyFieldsDescriptor);
  extensionContext.fields.register(structureFieldsDescriptor);
  extensionContext.fields.register(enumValueFieldsDescriptor);
  extensionContext.fields.register(projectFieldsDescriptor);
  extensionContext.fields.register(folderFieldsDescriptor);
  extensionContext.fields.register(enumFieldsDescriptor);

  return () => {
    extensionContext.fields.unregister(externalComponentFieldsDescriptor);
    extensionContext.fields.unregister(externalVariableFieldsDescriptor);
    extensionContext.fields.unregister(externalActionFieldsDescriptor);
    extensionContext.fields.unregister(externalEventFieldsDescriptor);
    extensionContext.fields.unregister(externalFieldsDescriptor);

    extensionContext.fields.unregister(structurePropertyFieldsDescriptor);
    extensionContext.fields.unregister(enumPropertyFieldsDescriptor);
    extensionContext.fields.unregister(structureFieldsDescriptor);
    extensionContext.fields.unregister(enumValueFieldsDescriptor);
    extensionContext.fields.unregister(projectFieldsDescriptor);
    extensionContext.fields.unregister(folderFieldsDescriptor);
    extensionContext.fields.unregister(enumFieldsDescriptor);
  }
}
