import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { enumProperty, enumTable, enumValue, folder, project, structure, structureProperty } from '../definition/schema';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createInspectorView = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new View({
    key: 'web-app-inspector',
    initialValue: {
      order: 0,
      title: 'Inspector',
      position: 'secondary',
      icon: { name: 'edit' },
      description: 'Web app properties',
      allowedPositions: ['primary', 'secondary', 'panel'],
      getViewContent: async () => new ViewContentForm({
        key: 'web-app-inspector-fields',
        initialValue: {
          getFields: async () => {
            const [selectionId] = await extensionContext.selection.get();

            const [item] = await databaseHelper
              .select({
                id: project.id,
                type: project.type,
              })
              .from(project)
              .where(eq(project.id, selectionId))
              .unionAll(
                databaseHelper
                  .select({
                    id: folder.id,
                    type: folder.type,
                  })
                  .from(folder)
                  .where(eq(folder.id, selectionId))
              )
              .unionAll(
                databaseHelper
                  .select({
                    id: enumTable.id,
                    type: enumTable.type,
                  })
                  .from(enumTable)
                  .where(eq(enumTable.id, selectionId))
              )
              .unionAll(
                databaseHelper
                  .select({
                    id: enumProperty.id,
                    type: enumProperty.type,
                  })
                  .from(enumProperty)
                  .where(eq(enumProperty.id, selectionId))
              )
              .unionAll(
                databaseHelper
                  .select({
                    id: enumValue.id,
                    type: enumValue.type,
                  })
                  .from(enumValue)
                  .where(eq(enumValue.id, selectionId))
              )
              .unionAll(
                databaseHelper
                  .select({
                    id: structure.id,
                    type: structure.type,
                  })
                  .from(structure)
                  .where(eq(structure.id, selectionId))
              )
              .unionAll(
                databaseHelper
                  .select({
                    id: structureProperty.id,
                    type: structureProperty.type,
                  })
                  .from(structureProperty)
                  .where(eq(structureProperty.propertyId, selectionId))
              )
              .limit(1);

            if (!item) return [];

            return await extensionContext.fields.get({
              targets: [{ id: item.id, kind: item.type }],
            });
          },
        },
        onDidMount: async (context) => {
          const unsubscribe = extensionContext.selection.subscribe(() => context.refetch());

          return async () => {
            unsubscribe();
          };
        },
      }),
    },
    onRequestOpen: async () => {
      await extensionContext.views.open({
        key: 'web-app-inspector'
      });
    },
  });
}
