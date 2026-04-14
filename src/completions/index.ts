import { TExtensionContext } from 'parsifly-extension-base';

import { createExternalVariableCompletionsDescriptor } from './externalVariables';
import { createComponentActionCompletionsDescriptor } from './componentActions';
import { createGlobalDataTypeCompletionsDescriptor } from './globalDataTypes';
import { createComponentEventCompletionsDescriptor } from './componentEvents';
import { createExternalActionCompletionsDescriptor } from './externalActions';
import { createProjectActionCompletionsDescriptor } from './projectActions';
import { createExternalEventCompletionsDescriptor } from './externalEvents';
import { createProjectEventCompletionsDescriptor } from './projectEvents';
import { createPageActionCompletionsDescriptor } from './pageActions';
import { createProjectVariableCompletionsDescriptor } from './projectVariables';


export const registerCompletions = (extensionContext: TExtensionContext) => {
  const externalVariableCompletionsDescriptor = createExternalVariableCompletionsDescriptor(extensionContext);
  const componentActionCompletionsDescriptor = createComponentActionCompletionsDescriptor(extensionContext);
  const projectVariableCompletionsDescriptor = createProjectVariableCompletionsDescriptor(extensionContext);
  const globalDataTypeCompletionsDescriptor = createGlobalDataTypeCompletionsDescriptor(extensionContext);
  const componentEventCompletionsDescriptor = createComponentEventCompletionsDescriptor(extensionContext);
  const externalActionCompletionsDescriptor = createExternalActionCompletionsDescriptor(extensionContext);
  const projectActionCompletionsDescriptor = createProjectActionCompletionsDescriptor(extensionContext);
  const externalEventCompletionsDescriptor = createExternalEventCompletionsDescriptor(extensionContext);
  const projectEventCompletionsDescriptor = createProjectEventCompletionsDescriptor(extensionContext);
  const pageActionCompletionsDescriptor = createPageActionCompletionsDescriptor(extensionContext);

  extensionContext.completions.register(externalVariableCompletionsDescriptor);
  extensionContext.completions.register(componentActionCompletionsDescriptor);
  extensionContext.completions.register(projectVariableCompletionsDescriptor);
  extensionContext.completions.register(globalDataTypeCompletionsDescriptor);
  extensionContext.completions.register(componentEventCompletionsDescriptor);
  extensionContext.completions.register(externalActionCompletionsDescriptor);
  extensionContext.completions.register(projectActionCompletionsDescriptor);
  extensionContext.completions.register(externalEventCompletionsDescriptor);
  extensionContext.completions.register(projectEventCompletionsDescriptor);
  extensionContext.completions.register(pageActionCompletionsDescriptor);

  return () => {
    extensionContext.completions.unregister(pageActionCompletionsDescriptor);
    extensionContext.completions.unregister(projectEventCompletionsDescriptor);
    extensionContext.completions.unregister(externalEventCompletionsDescriptor);
    extensionContext.completions.unregister(projectActionCompletionsDescriptor);
    extensionContext.completions.unregister(externalActionCompletionsDescriptor);
    extensionContext.completions.unregister(componentEventCompletionsDescriptor);
    extensionContext.completions.unregister(globalDataTypeCompletionsDescriptor);
    extensionContext.completions.unregister(projectVariableCompletionsDescriptor);
    extensionContext.completions.unregister(componentActionCompletionsDescriptor);
    extensionContext.completions.unregister(externalVariableCompletionsDescriptor);
  };
};
