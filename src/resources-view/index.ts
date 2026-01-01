import { ListProvider, ListViewItem, TApplication, View } from 'parsifly-extension-base'
import { dbQueryBuilder } from '../definition';


export const createResourcesView = (application: TApplication) => {
  return new View({
    key: 'web-app-resources',
    initialValue: {
      title: 'Resources',
      position: 'primary',
      icon: { name: 'VscFiles' },
      description: 'All Web Application Resources',
      dataProvider: new ListProvider({
        key: 'list-all-web-app-resources',
        getItems: async () => {
          const project = await dbQueryBuilder
            .selectFrom('project')
            .select(['id', 'name', 'description', 'type'])
            .executeTakeFirstOrThrow();

          return [
            new ListViewItem({
              key: project.id,
              initialValue: {
                children: false,
                label: project.name,
                icon: { type: 'project' },
                description: project.description,
                onItemClick: async () => {
                  await application.selection.select(project.id);
                },
              },
              onDidMount: async (context) => {
                const selectionId = await application.selection.get()
                context.select(selectionId.includes(project.id));

                const unsubscribe = await application.data.subscribe({
                  query: (
                    dbQueryBuilder
                      .selectFrom('project')
                      .select(['name', 'description'])
                      .compile()
                  ),
                  listener: async ({ rows: [item] }) => {
                    context.set('label', item.name);
                    context.set('description', item.description);
                  },
                });

                context.onDidUnmount(async () => await unsubscribe());
              },
            }),
          ];
        },
      }),
    },
  });
}
