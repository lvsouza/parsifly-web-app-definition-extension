import { TExtensionContext } from 'parsifly-extension-base';

import { createGlobalDataTypeCompletionsDescriptor } from './globalDataTypes';
import { createProjectActionCompletionsDescriptor } from './projectActions';
import { createProjectEventCompletionsDescriptor } from './projectEvents';


export const registerCompletions = (extensionContext: TExtensionContext) => {
  const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(extensionContext);
  const projectActionCompletionsDescriptor = createProjectActionCompletionsDescriptor(extensionContext);
  const projectEventCompletionsDescriptor = createProjectEventCompletionsDescriptor(extensionContext);

  extensionContext.completions.register(globalDataTypeCompletionsDescriptor);
  extensionContext.completions.register(projectActionCompletionsDescriptor);
  extensionContext.completions.register(projectEventCompletionsDescriptor);

  return () => {
    extensionContext.completions.unregister(projectEventCompletionsDescriptor);
    extensionContext.completions.unregister(projectActionCompletionsDescriptor);
    extensionContext.completions.unregister(globalDataTypeCompletionsDescriptor);
  }
}
