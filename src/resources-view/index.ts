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

          return [
            new ListViewItem({
              key: 'project-id',
              initialValue: {
                children: false,
                label: 'Unnamed',
                icon: { type: 'project' },
                description: 'Project description',
                onItemClick: async () => {
                  const result = await dbQueryBuilder
                    .selectFrom('project')
                    .selectAll()
                    .execute()

                  console.log('EXTENSION DATA', result)
                },
              },
            }),
            new ListViewItem({
              key: 'project-1',
              initialValue: {
                children: false,
                label: 'Create',
                icon: { type: 'page-add' },
                description: 'Project description',
                onItemClick: async () => {

                  const result = await dbQueryBuilder
                    .insertInto('project')
                    .values({
                      public: false,
                      version: '1.0.0',
                      name: 'Testando',
                      description: 'Testando',
                    })
                    .execute()

                  console.log('EXTENSION DATA', result)
                },
              },
            }),
          ];
        },
      }),
    },
    onDidMount: async (context) => {

      // Subscribe in database state to
      const unsubscribe = await application.data.subscribe({
        query: (
          dbQueryBuilder
            .selectFrom('project')
            .selectAll()
            .compile()
        ),
        listener: async (data) => {
          console.log('EXTENSION SUBSCRIPTION', data);
        },
      });

      context.onDidUnmount(async () => await unsubscribe())
    }
  });
}
