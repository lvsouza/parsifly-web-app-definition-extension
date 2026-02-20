import { TExtensionContext } from 'parsifly-extension-base';

import { createGlobalEnumAndStructureNamesDiagnosticsAnalyzer } from './enumAndStructureNames';
import { createStructurePropertyDiagnosticsAnalyzer } from './structureProperty';
import { createStatusBarProblemsIndicator } from './StatusBarProblemsIndicator';
import { createEnumPropertyDiagnosticsAnalyzer } from './enumProperty';
import { createFolderNamesDiagnosticsAnalyzer } from './folderNames';
import { createEnumValuesDiagnosticsAnalyzer } from './enumValues';
import { createStructureDiagnosticsAnalyzer } from './structure';
import { createEnumDiagnosticsAnalyzer } from './enum';


export const registerDiagnosticAnalyzers = async (extensionContext: TExtensionContext) => {
  const globalEnumAndStructureNamesDiagnosticsAnalyzer = createGlobalEnumAndStructureNamesDiagnosticsAnalyzer(extensionContext);
  const structurePropertyDiagnosticsAnalyzer = createStructurePropertyDiagnosticsAnalyzer(extensionContext);
  const enumPropertyDiagnosticsAnalyzer = createEnumPropertyDiagnosticsAnalyzer(extensionContext);
  const folderNamesDiagnosticsAnalyzer = createFolderNamesDiagnosticsAnalyzer(extensionContext);
  const enumValuesDiagnosticsAnalyzer = createEnumValuesDiagnosticsAnalyzer(extensionContext);
  const structureDiagnosticsAnalyzer = createStructureDiagnosticsAnalyzer(extensionContext);
  const enumDiagnosticsAnalyzer = createEnumDiagnosticsAnalyzer(extensionContext);
  const diagnosticsIndicator = createStatusBarProblemsIndicator(extensionContext);


  await extensionContext.statusBarItems.register(diagnosticsIndicator);

  await extensionContext.diagnostics.register(globalEnumAndStructureNamesDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(structurePropertyDiagnosticsAnalyzer);
  await extensionContext.diagnostics.register(enumPropertyDiagnosticsAnalyzer);
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
    await extensionContext.diagnostics.unregister(enumPropertyDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(structurePropertyDiagnosticsAnalyzer);
    await extensionContext.diagnostics.unregister(globalEnumAndStructureNamesDiagnosticsAnalyzer);
  };
};
