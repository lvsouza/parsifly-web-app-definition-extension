import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { enumProperty, enumTable, enumValue, external, externalAction, externalComponent, externalEvent, externalVariable, folder, project, structure, structureProperty } from '../definition/schema';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


const findById = async (extensionContext: TExtensionContext, id: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const tables = [
    project,
    folder,
    enumTable,
    enumProperty,
    enumValue,
    structure,
    external,
    externalVariable,
    externalAction,
    externalEvent,
    externalComponent,
  ];

  for (const table of tables) {
    const [result] = await databaseHelper
      .select({ id: table.id, type: table.type })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);

    if (result) return result;
  }

  // Usado para pegar uma "sub-propriedade" de uma entidade que tem propriedades com ligação em "property"
  const [result] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${structureProperty.type.default})`)
  if (result) return result;

  return null;
}


export const createInspectorView = (extensionContext: TExtensionContext) => {
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
            if (!selectionId) return [];

            const item = await findById(extensionContext, selectionId);
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
