import { View, Action, TExtensionContext, ViewContentWebView } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { external } from '../definition/schema';


export const createTextEditor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  return new View({
    key: 'text-editor',
    initialValue: {
      selector: [],
      allowWindow: true,
      title: "Text Editor",
      position: 'editor',
      icon: { name: 'symbol-string' },
      description: "This editor allow you to edit the components or pages ui content",
      window: {
        width: 700,
        height: 500,
      },
      getActions: async (context) => {
        return [
          new Action({
            key: 'reload',
            initialValue: {
              label: "Reload editor",
              icon: { name: "refresh" },
              description: "Reload editor",
              action: async () => {
                await context.refetch();
              },
            },
          }),
        ];
      },
      getViewContent: async (context) => new ViewContentWebView({
        key: 'text-editor-view-content',
        initialValue: {
          backgroundTransparent: true,
          entryPoint: {
            file: "index.html",
            basePath: "views/text-editor",
          },
          onDidMessage: async (_webViewContext, event, value) => {
            if (typeof context.customData !== 'object') return;
            if (value === null || value === undefined) return;
            if (event !== 'change') return;

            const customData: { resourceId: string, resourceType: string, resourceProperty: string } | undefined = context.customData as any
            if (!customData?.resourceId) return;

            await databaseHelper.update(external).set({ source: value as string }).where(eq(external.id, customData.resourceId));
          },
        },
        onDidMount: async (webViewContext) => {
          if (typeof context.customData !== 'object') return;

          const customData: { resourceId: string, resourceType: string, resourceProperty: string } | undefined = context.customData as any
          if (!customData?.resourceId) return;

          const [result] = await databaseHelper.select({ source: external.source }).from(external).where(eq(external.id, customData.resourceId));
          await webViewContext.sendMessage('value', result.source);
        }
      }),
    },
  });
}
