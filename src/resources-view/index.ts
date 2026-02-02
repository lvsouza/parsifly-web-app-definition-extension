import { ViewContentList, ListViewItem, TExtensionContext, View } from 'parsifly-extension-base'

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { loadStructuresFolder } from './structures';
import { loadComponentsFolder } from './components';
import { loadActionsFolder } from './actions';
import { loadPagesFolder } from './pages';
import { loadEnumsFolder } from './enums';


export const createResourcesView = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new View({
    key: 'web-app-resources',
    initialValue: {
      order: 0,
      title: 'Resources',
      position: 'primary',
      icon: { name: 'files' },
      description: 'All Web extensionContext Resources',
      allowedPositions: ['primary', 'secondary', 'panel'],
      getViewContent: async () => new ViewContentList({
        key: 'list-all-web-app-resources',
        initialValue: {
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
                  onItemToggle: async (context) => {
                    const isOpen = !context.currentValue.opened;

                    await context.set('opened', isOpen);

                    if (isOpen) {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), project.id]);
                    } else {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== project.id));
                    }
                  },
                  onItemDoubleClick: async (context) => {
                    const isOpen = !context.currentValue.opened;

                    await context.set('opened', isOpen);

                    if (isOpen) {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), project.id]);
                    } else {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== project.id));
                    }
                  },
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
                          onItemToggle: async (context) => {
                            const isOpen = !context.currentValue.opened;

                            await context.set('opened', isOpen);

                            if (isOpen) {
                              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'shared-group']);
                            } else {
                              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'shared-group'));
                            }
                          },
                          onItemDoubleClick: async (context) => {
                            const isOpen = !context.currentValue.opened;

                            await context.set('opened', isOpen);

                            if (isOpen) {
                              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'shared-group']);
                            } else {
                              await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'shared-group'));
                            }
                          },
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
                                onItemToggle: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'variables-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'variables-group'));
                                  }
                                },
                                onItemDoubleClick: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'variables-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'variables-group'));
                                  }
                                },
                              },
                            }),
                            loadEnumsFolder(extensionContext, project.id, project.id),
                            loadStructuresFolder(extensionContext, project.id, project.id),
                            new ListViewItem({
                              key: 'assets-group',
                              initialValue: {
                                children: true,
                                label: 'Assets',
                                disableSelect: true,
                                icon: { type: 'attachment-folder' },
                                onItemToggle: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'assets-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'assets-group'));
                                  }
                                },
                                onItemDoubleClick: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'assets-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'assets-group'));
                                  }
                                },
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
                              onDidMount: async (context) => {
                                const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                                context.set('opened', openedIds ? openedIds.includes('assets-group') : context.currentValue.opened);
                              }
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
                                onItemToggle: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'advanced-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'advanced-group'));
                                  }
                                },
                                onItemDoubleClick: async (context) => {
                                  const isOpen = !context.currentValue.opened;

                                  await context.set('opened', isOpen);

                                  if (isOpen) {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'advanced-group']);
                                  } else {
                                    await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'advanced-group'));
                                  }
                                },
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
                                      onItemToggle: async (context) => {
                                        const isOpen = !context.currentValue.opened;

                                        await context.set('opened', isOpen);

                                        if (isOpen) {
                                          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'externals-group']);
                                        } else {
                                          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'externals-group'));
                                        }
                                      },
                                      onItemDoubleClick: async (context) => {
                                        const isOpen = !context.currentValue.opened;

                                        await context.set('opened', isOpen);

                                        if (isOpen) {
                                          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'externals-group']);
                                        } else {
                                          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'externals-group'));
                                        }
                                      },
                                      getItems: async () => [
                                        new ListViewItem({
                                          key: 'external-item-group',
                                          initialValue: {
                                            children: true,
                                            label: 'Socket.IO',
                                            disableSelect: true,
                                            icon: { type: 'external-logic' },
                                            onItemToggle: async (context) => {
                                              const isOpen = !context.currentValue.opened;

                                              await context.set('opened', isOpen);

                                              if (isOpen) {
                                                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-item-group']);
                                              } else {
                                                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-item-group'));
                                              }
                                            },
                                            onItemDoubleClick: async (context) => {
                                              const isOpen = !context.currentValue.opened;

                                              await context.set('opened', isOpen);

                                              if (isOpen) {
                                                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-item-group']);
                                              } else {
                                                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-item-group'));
                                              }
                                            },
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
                                    onDidMount: async (context) => {
                                      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                                      context.set('opened', openedIds ? openedIds.includes('externals-group') : context.currentValue.opened);
                                    }
                                  }),
                                ],
                              },
                              onDidMount: async (context) => {
                                const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                                context.set('opened', openedIds ? openedIds.includes('advanced-group') : context.currentValue.opened);
                              }
                            }),
                          ],
                        },
                        onDidMount: async (context) => {
                          const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                          context.set('opened', openedIds ? openedIds.includes('shared-group') : context.currentValue.opened);
                        }
                      })
                    ];
                  }
                },
                onDidMount: async (context) => {
                  const selectionId = await extensionContext.selection.get()
                  context.set('selected', selectionId.includes(project.id));

                  const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                  context.set('opened', openedIds ? openedIds.includes(project.id) : context.currentValue.opened);

                  const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(project.id)));
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
        },
      }),
    },
    onRequestOpen: async () => {
      await extensionContext.views.open({
        key: 'web-app-resources'
      });
    },
  });
}
