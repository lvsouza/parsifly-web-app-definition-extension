import { ListProvider, ListViewItem, TExtensionContext, View } from 'parsifly-extension-base'

import { loadStructuresFolder } from './structures';
import { loadComponentsFolder } from './components';
import { loadActionsFolder } from './actions';
import { loadPagesFolder } from './pages';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


export const createResourcesView = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new View({
    key: 'web-app-resources',
    initialValue: {
      title: 'Resources',
      position: 'primary',
      icon: { name: 'files' },
      description: 'All Web extensionContext Resources',
      dataProvider: new ListProvider({
        key: 'list-all-web-app-resources',
        getItems: async () => {
          const project = await databaseHelper
            .selectFrom('project')
            .select(['id', 'name', 'description', 'type'])
            .executeTakeFirstOrThrow();

          return [
            new ListViewItem({
              key: project.id,
              initialValue: {
                opened: true,
                children: true,
                label: project.name,
                icon: { type: 'project' },
                description: project.description || undefined,
                onItemClick: async () => {
                  await extensionContext.selection.select(project.id);
                },
                getItems: async () => {
                  return [
                    loadPagesFolder(extensionContext, project.id, project.id),
                    new ListViewItem({
                      key: 'shared-group',
                      initialValue: {
                        opened: true,
                        children: true,
                        label: 'Shared',
                        disableSelect: true,
                        icon: { type: 'shared-folder' },
                        getItems: async () => [
                          loadComponentsFolder(extensionContext, project.id, project.id),
                          loadActionsFolder(extensionContext, project.id, project.id),
                          new ListViewItem({
                            key: 'variables-group',
                            initialValue: {
                              children: false,
                              label: 'Variables',
                              disableSelect: true,
                              getItems: async () => [],
                              icon: { type: 'variable-global-folder' },
                            },
                          }),
                          loadStructuresFolder(extensionContext, project.id, project.id),
                          new ListViewItem({
                            key: 'assets-group',
                            initialValue: {
                              children: true,
                              label: 'Assets',
                              disableSelect: true,
                              icon: { type: 'attachment-folder' },
                              getItems: async () => [
                                new ListViewItem({
                                  key: 'themes-group',
                                  initialValue: {
                                    children: false,
                                    label: 'Themes',
                                    disableSelect: true,
                                    getItems: async () => [],
                                    icon: { type: 'theme-folder' },
                                  },
                                }),
                                new ListViewItem({
                                  key: 'files-group',
                                  initialValue: {
                                    label: 'Files',
                                    children: false,
                                    disableSelect: true,
                                    getItems: async () => [],
                                    icon: { type: 'file-folder' },
                                  },
                                }),
                              ],
                            },
                          }),
                          new ListViewItem({
                            key: 'dependencies-group',
                            initialValue: {
                              children: false,
                              disableSelect: true,
                              label: 'Dependencies',
                              icon: { type: 'dependency-folder' },
                              getItems: async () => [],
                            },
                          }),
                          new ListViewItem({
                            key: 'advanced-group',
                            initialValue: {
                              children: true,
                              disableSelect: true,
                              label: 'Advanced',
                              icon: { type: 'advanced-folder' },
                              getItems: async () => [
                                new ListViewItem({
                                  key: 'emittable-events-group',
                                  initialValue: {
                                    children: false,
                                    label: 'Events',
                                    disableSelect: true,
                                    getItems: async () => [],
                                    icon: { type: 'event-folder' },
                                  },
                                }),
                                new ListViewItem({
                                  key: 'events-listeners-group',
                                  initialValue: {
                                    children: false,
                                    label: 'Listeners',
                                    disableSelect: true,
                                    getItems: async () => [],
                                    icon: { type: 'listener-folder' },
                                  },
                                }),
                                new ListViewItem({
                                  key: 'externals-group',
                                  initialValue: {
                                    children: true,
                                    disableSelect: true,
                                    label: 'External logic',
                                    icon: { type: 'external-logic-folder' },
                                    getItems: async () => [
                                      new ListViewItem({
                                        key: 'external-item-group',
                                        initialValue: {
                                          children: true,
                                          label: 'Socket.IO',
                                          disableSelect: true,
                                          icon: { type: 'external-logic' },
                                          getItems: async () => [
                                            new ListViewItem({
                                              key: 'callable-actions-group',
                                              initialValue: {
                                                children: false,
                                                label: 'Actions',
                                                disableSelect: true,
                                                getItems: async () => [],
                                                icon: { type: 'action-global-folder' },
                                              },
                                            }),
                                            new ListViewItem({
                                              key: 'emittable-external-events-group',
                                              initialValue: {
                                                children: false,
                                                label: 'Events',
                                                disableSelect: true,
                                                getItems: async () => [],
                                                icon: { type: 'listen-only-event-folder' },
                                              },
                                            }),
                                          ],
                                        },
                                      }),
                                    ],
                                  },
                                }),
                              ],
                            },
                          }),
                        ],
                      },
                    })
                  ];
                }
              },
              onDidMount: async (context) => {
                const selectionId = await extensionContext.selection.get()
                context.select(selectionId.includes(project.id));

                const selectionSub = extensionContext.selection.subscribe(key => context.select(key.includes(project.id)));
                const unsubscribe = await extensionContext.data.subscribe({
                  query: (
                    databaseHelper
                      .selectFrom('project')
                      .select(['id', 'name', 'description'])
                      .compile()
                  ),
                  listener: async ({ rows: [item] }) => {
                    context.set('label', item.name);
                    context.set('description', item.description);
                  },
                });

                return async () => {
                  await unsubscribe();
                  selectionSub();
                };
              },
            }),
          ];
        },
      }),
    },
  });
}
