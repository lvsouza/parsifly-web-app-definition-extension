import { TExtensionContext } from 'parsifly-extension-base';

import { createStructureAttributeFieldsDescriptor } from './structure/StructureAttributeFieldsDescriptor';
import { createEnumAttributeFieldsDescriptor } from './enum/EnumAttributeFieldsDescriptor';
import { createStructureFieldsDescriptor } from './structure/StructureFieldsDescriptor';
import { createEnumValueFieldsDescriptor } from './enum/EnumValueFieldsDescriptor';
import { createComponentFieldsDescriptor } from './ComponentFieldsDescriptor';
import { createProjectFieldsDescriptor } from './ProjectFieldsDescriptor';
import { createEnumFieldsDescriptor } from './enum/EnumFieldsDescriptor';
import { createActionFieldsDescriptor } from './ActionFieldsDescriptor';
import { createFolderFieldsDescriptor } from './FolderFieldsDescriptor';
import { createPageFieldsDescriptor } from './PageFieldsDescriptor';


export const registerFieldsDescriptors = (extensionContext: TExtensionContext) => {
  const structureAttributeFieldsDescriptor = createStructureAttributeFieldsDescriptor(extensionContext);
  const enumAttributeFieldsDescriptor = createEnumAttributeFieldsDescriptor(extensionContext);
  const enumValueFieldsDescriptor = createEnumValueFieldsDescriptor(extensionContext);
  const structureFieldsDescriptor = createStructureFieldsDescriptor(extensionContext);
  const componentFieldsDescriptor = createComponentFieldsDescriptor(extensionContext);
  const projectFieldsDescriptor = createProjectFieldsDescriptor(extensionContext);
  const folderFieldsDescriptor = createFolderFieldsDescriptor(extensionContext);
  const actionFieldsDescriptor = createActionFieldsDescriptor(extensionContext);
  const pageFieldsDescriptor = createPageFieldsDescriptor(extensionContext);
  const enumFieldsDescriptor = createEnumFieldsDescriptor(extensionContext);

  extensionContext.fields.register(structureAttributeFieldsDescriptor);
  extensionContext.fields.register(enumAttributeFieldsDescriptor);
  extensionContext.fields.register(structureFieldsDescriptor);
  extensionContext.fields.register(componentFieldsDescriptor);
  extensionContext.fields.register(enumValueFieldsDescriptor);
  extensionContext.fields.register(projectFieldsDescriptor);
  extensionContext.fields.register(actionFieldsDescriptor);
  extensionContext.fields.register(folderFieldsDescriptor);
  extensionContext.fields.register(pageFieldsDescriptor);
  extensionContext.fields.register(enumFieldsDescriptor);

  return () => {
    extensionContext.fields.unregister(structureAttributeFieldsDescriptor);
    extensionContext.fields.unregister(enumAttributeFieldsDescriptor);
    extensionContext.fields.unregister(structureFieldsDescriptor);
    extensionContext.fields.unregister(componentFieldsDescriptor);
    extensionContext.fields.unregister(enumValueFieldsDescriptor);
    extensionContext.fields.unregister(projectFieldsDescriptor);
    extensionContext.fields.unregister(actionFieldsDescriptor);
    extensionContext.fields.unregister(folderFieldsDescriptor);
    extensionContext.fields.unregister(pageFieldsDescriptor);
    extensionContext.fields.unregister(enumFieldsDescriptor);
  }
}
