import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';
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

            const item = await databaseHelper
              .selectFrom('project')
              .select(['id', 'type'])
              .where('id', '=', selectionId)

              .unionAll(databaseHelper.selectFrom('folder').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('enum').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('enumAttribute').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('enumValue').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('structure').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('structureAttribute').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('page').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('component').select(['id', 'type']).where('id', '=', selectionId))
              .unionAll(databaseHelper.selectFrom('action').select(['id', 'type']).where('id', '=', selectionId))

              .executeTakeFirst();

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
