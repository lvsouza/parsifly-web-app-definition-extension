import { TExtensionContext } from 'parsifly-extension-base';

import { createComponentActionCompletionsDescriptor } from './componentActions';
import { createGlobalDataTypeCompletionsDescriptor } from './globalDataTypes';
import { createComponentEventCompletionsDescriptor } from './componentEvents';
import { createExternalActionCompletionsDescriptor } from './externalActions';
import { createProjectActionCompletionsDescriptor } from './projectActions';
import { createExternalEventCompletionsDescriptor } from './externalEvents';
import { createProjectEventCompletionsDescriptor } from './projectEvents';


export const registerCompletions = (extensionContext: TExtensionContext) => {
  const componentActionCompletionsDescriptor = createComponentActionCompletionsDescriptor(extensionContext);
  const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(extensionContext);
  const componentEventCompletionsDescriptor = createComponentEventCompletionsDescriptor(extensionContext);
  const externalActionCompletionsDescriptor = createExternalActionCompletionsDescriptor(extensionContext);
  const projectActionCompletionsDescriptor = createProjectActionCompletionsDescriptor(extensionContext);
  const externalEventCompletionsDescriptor = createExternalEventCompletionsDescriptor(extensionContext);
  const projectEventCompletionsDescriptor = createProjectEventCompletionsDescriptor(extensionContext);

  extensionContext.completions.register(componentActionCompletionsDescriptor);
  extensionContext.completions.register(globalDataTypeCompletionsDescriptor);
  extensionContext.completions.register(componentEventCompletionsDescriptor);
  extensionContext.completions.register(externalActionCompletionsDescriptor);
  extensionContext.completions.register(projectActionCompletionsDescriptor);
  extensionContext.completions.register(externalEventCompletionsDescriptor);
  extensionContext.completions.register(projectEventCompletionsDescriptor);

  return () => {
    extensionContext.completions.unregister(projectEventCompletionsDescriptor);
    extensionContext.completions.unregister(externalEventCompletionsDescriptor);
    extensionContext.completions.unregister(projectActionCompletionsDescriptor);
    extensionContext.completions.unregister(externalActionCompletionsDescriptor);
    extensionContext.completions.unregister(componentEventCompletionsDescriptor);
    extensionContext.completions.unregister(globalDataTypeCompletionsDescriptor);
    extensionContext.completions.unregister(componentActionCompletionsDescriptor);
  };
};
