import { TExtensionContext } from 'parsifly-extension-base';

import { createStructurePropertyFieldsDescriptor } from './structure/StructurePropertyFieldsDescriptor';
import { createEnumPropertyFieldsDescriptor } from './enum/EnumPropertyFieldsDescriptor';
import { createStructureFieldsDescriptor } from './structure/StructureFieldsDescriptor';
import { createEnumValueFieldsDescriptor } from './enum/EnumValueFieldsDescriptor';
import { createProjectFieldsDescriptor } from './ProjectFieldsDescriptor';
import { createEnumFieldsDescriptor } from './enum/EnumFieldsDescriptor';
import { createFolderFieldsDescriptor } from './FolderFieldsDescriptor';


export const registerFieldsDescriptors = (extensionContext: TExtensionContext) => {
  const structurePropertyFieldsDescriptor = createStructurePropertyFieldsDescriptor(extensionContext);
  const enumPropertyFieldsDescriptor = createEnumPropertyFieldsDescriptor(extensionContext);
  const enumValueFieldsDescriptor = createEnumValueFieldsDescriptor(extensionContext);
  const structureFieldsDescriptor = createStructureFieldsDescriptor(extensionContext);
  const projectFieldsDescriptor = createProjectFieldsDescriptor(extensionContext);
  const folderFieldsDescriptor = createFolderFieldsDescriptor(extensionContext);
  const enumFieldsDescriptor = createEnumFieldsDescriptor(extensionContext);

  extensionContext.fields.register(structurePropertyFieldsDescriptor);
  extensionContext.fields.register(enumPropertyFieldsDescriptor);
  extensionContext.fields.register(structureFieldsDescriptor);
  extensionContext.fields.register(enumValueFieldsDescriptor);
  extensionContext.fields.register(projectFieldsDescriptor);
  extensionContext.fields.register(folderFieldsDescriptor);
  extensionContext.fields.register(enumFieldsDescriptor);

  return () => {
    extensionContext.fields.unregister(structurePropertyFieldsDescriptor);
    extensionContext.fields.unregister(enumPropertyFieldsDescriptor);
    extensionContext.fields.unregister(structureFieldsDescriptor);
    extensionContext.fields.unregister(enumValueFieldsDescriptor);
    extensionContext.fields.unregister(projectFieldsDescriptor);
    extensionContext.fields.unregister(folderFieldsDescriptor);
    extensionContext.fields.unregister(enumFieldsDescriptor);
  }
}
