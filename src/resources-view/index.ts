import { ViewContentList, ListViewItem, TExtensionContext, View } from 'parsifly-extension-base'

import { createDatabaseHelper, mappableQuery } from '../definition/DatabaseHelper';
import { loadExternalsRootFolder } from './externals/externalRootFolder';
import { loadStructuresFolder } from './structures';
import { project } from '../definition/schema';
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
            const [result] = await databaseHelper
              .select({
                id: project.id,
                name: project.name,
                type: project.type,
                description: project.description,
              })
              .from(project)
              .limit(1);

            return [
              new ListViewItem({
                key: result.id,
                initialValue: {
                  opened: true,
                  children: true,
                  label: result.name,
                  icon: { type: 'project' },
                  description: result.description || undefined,
                  onItemToggle: async (context) => {
                    const isOpen = !context.currentValue.opened;

                    await context.set('opened', isOpen);

                    if (isOpen) {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), result.id]);
                    } else {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== result.id));
                    }
                  },
                  onItemDoubleClick: async (context) => {
                    const isOpen = !context.currentValue.opened;

                    await context.set('opened', isOpen);

                    if (isOpen) {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), result.id]);
                    } else {
                      await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== result.id));
                    }
                  },
                  onItemClick: async () => {
                    await extensionContext.selection.select(result.id);
                  },
                  getItems: async () => {
                    return [
                      new ListViewItem({
                        key: 'router',
                        initialValue: {
                          children: false,
                          label: 'Routes',
                          disableSelect: true,
                          icon: { type: 'router' },
                        },
                      }),
                      //TODO: loadPagesFolder(extensionContext, result.id, result.id),
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
                            //TODO: loadComponentsFolder(extensionContext, result.id, result.id),
                            //TODO: loadActionsFolder(extensionContext, result.id, result.id),
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
                            loadEnumsFolder(extensionContext, result.id, result.id),
                            loadStructuresFolder(extensionContext, result.id, result.id),
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
                                  await loadExternalsRootFolder(extensionContext, result.id, result.id),
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
                  context.set('selected', selectionId.includes(result.id));

                  const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
                  context.set('opened', openedIds ? openedIds.includes(result.id) : context.currentValue.opened);

                  const selectionSub = extensionContext.selection.subscribe(key => context.set('selected', key.includes(result.id)));

                  const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
                    databaseHelper
                      .select({
                        id: project.id,
                        name: project.name,
                        description: project.description,
                      })
                      .from(project)
                  );
                  const unsubscribe = await extensionContext.data.subscribe({
                    query: itemDetailQuery,
                    listener: async (data) => {
                      const [item] = itemDetailMapResult(data);
                      context.set('label', item.name);
                      context.set('description', item.description || '');
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
