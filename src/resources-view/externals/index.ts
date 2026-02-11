import { ListViewItem, TExtensionContext } from 'parsifly-extension-base';


export const loadExternalsFolder = (extensionContext: TExtensionContext, _projectId: string, _parentId: string) => {
  return new ListViewItem({
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
          key: 'external-core-group',
          initialValue: {
            children: true,
            label: 'Core',
            disableSelect: true,
            icon: { type: 'external-logic' },
            onItemToggle: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-core-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-core-group'));
              }
            },
            onItemDoubleClick: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-core-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-core-group'));
              }
            },
            getItems: async () => [
              new ListViewItem({
                key: 'external-core-variables-group',
                initialValue: {
                  children: false,
                  label: 'Variables',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'variable-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-core-actions-group',
                initialValue: {
                  children: false,
                  label: 'Actions',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'action-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-core-events-group',
                initialValue: {
                  children: false,
                  label: 'Events',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'listen-only-event-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-core-component-group',
                initialValue: {
                  children: false,
                  label: 'Components',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'component-folder' },
                },
              }),
            ],
          },
        }),
        new ListViewItem({
          key: 'external-date-fns-group',
          initialValue: {
            children: true,
            label: 'DateFns',
            disableSelect: true,
            icon: { type: 'external-logic' },
            onItemToggle: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-date-fns-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-date-fns-group'));
              }
            },
            onItemDoubleClick: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-date-fns-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-date-fns-group'));
              }
            },
            getItems: async () => [
              new ListViewItem({
                key: 'external-date-fns-variables-group',
                initialValue: {
                  children: false,
                  label: 'Variables',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'variable-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-date-fns-actions-group',
                initialValue: {
                  children: false,
                  label: 'Actions',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'action-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-date-fns-events-group',
                initialValue: {
                  children: false,
                  label: 'Events',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'listen-only-event-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-date-fns-component-group',
                initialValue: {
                  children: false,
                  label: 'Components',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'component-folder' },
                },
              }),
            ],
          },
        }),
        new ListViewItem({
          key: 'external-socket-io-group',
          initialValue: {
            children: true,
            label: 'SocketIO',
            disableSelect: true,
            icon: { type: 'external-logic' },
            onItemToggle: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-socket-io-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-socket-io-group'));
              }
            },
            onItemDoubleClick: async (context) => {
              const isOpen = !context.currentValue.opened;

              await context.set('opened', isOpen);

              if (isOpen) {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'external-socket-io-group']);
              } else {
                await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'external-socket-io-group'));
              }
            },
            getItems: async () => [
              new ListViewItem({
                key: 'external-socket-io-variables-group',
                initialValue: {
                  children: false,
                  label: 'Variables',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'variable-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-socket-io-component-group',
                initialValue: {
                  children: false,
                  label: 'Components',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'component-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-socket-io-actions-group',
                initialValue: {
                  children: false,
                  label: 'Actions',
                  disableSelect: true,
                  getItems: async () => [],
                  icon: { type: 'action-global-folder' },
                },
              }),
              new ListViewItem({
                key: 'external-socket-io-events-group',
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
  })
}
