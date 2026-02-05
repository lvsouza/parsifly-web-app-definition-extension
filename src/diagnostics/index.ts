import { TExtensionContext } from 'parsifly-extension-base';

import { createGlobalEnumAndStructureNamesDiagnosticsAnalyzer } from './enum-and-structure-names';
import { createStructureAttributeDiagnosticsAnalyzer } from './structure-attribute';
import { createStatusBarProblemsIndicator } from './StatusBarProblemsIndicator';
import { createEnumAttributeDiagnosticsAnalyzer } from './enum-attribute';
import { createFolderNamesDiagnosticsAnalyzer } from './folder-names';
import { createEnumValuesDiagnosticsAnalyzer } from './enum-values';
import { createStructureDiagnosticsAnalyzer } from './structure';
import { createEnumDiagnosticsAnalyzer } from './enum';


export const registerDiagnosticAnalyzers = async (extensionContext: TExtensionContext) => {
  const globalEnumAndStructureNamesDiagnosticsAnalyzer = createGlobalEnumAndStructureNamesDiagnosticsAnalyzer(extensionContext);
  const structureAttributeDiagnosticsAnalyzer = createStructureAttributeDiagnosticsAnalyzer(extensionContext);
  const enumAttributeDiagnosticsAnalyzer = createEnumAttributeDiagnosticsAnalyzer(extensionContext);
  const folderNamesDiagnosticsAnalyzer = createFolderNamesDiagnosticsAnalyzer(extensionContext);
  const enumValuesDiagnosticsAnalyzer = createEnumValuesDiagnosticsAnalyzer(extensionContext);
  const structureDiagnosticsAnalyzer = createStructureDiagnosticsAnalyzer(extensionContext);
  const enumDiagnosticsAnalyzer = createEnumDiagnosticsAnalyzer(extensionContext);
  const diagnosticsIndicator = createStatusBarProblemsIndicator(extensionContext);


  await extensionContext.statusBarItems.register(diagnosticsIndicator);

  await extensionContext.diagnostics.register(globalEnumAndStructureNamesDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(structureAttributeDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(enumAttributeDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(folderNamesDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(enumValuesDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(structureDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(enumDiagnosticsAnalyzer);


  return async () => {
    await extensionContext.statusBarItems.unregister(diagnosticsIndicator);
    await extensionContext.diagnostics.unregister(enumDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(structureDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(enumValuesDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(folderNamesDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(enumAttributeDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(structureAttributeDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(globalEnumAndStructureNamesDiagnosticsAnalyzer);
  };
};
