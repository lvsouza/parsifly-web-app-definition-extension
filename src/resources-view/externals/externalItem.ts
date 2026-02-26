import { Action, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { loadExternalVariableFolder } from './variable/externalVariablesFolder';
import { loadExternalActionFolder } from './action/externalActionsFolder';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';
import { loadExternalEventFolder } from './event/externalEventsFolder';
import { external, External } from '../../definition/schema';
import { loadExternalComponentFolder } from './component/externalComponentsFolder';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<External, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalItem = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.delete(external).where(eq(external.id, current.id));
      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      children: true,
      label: current.name,
      icon: { type: 'external-logic' },
      description: current.description || '',
      onItemClick: async () => {
        await extensionContext.selection.select(current.id);
      },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.id]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.id));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.id]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.id));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: 'delete-folder',
            initialValue: {
              label: 'Delete folder',
              icon: { type: 'delete' },
              action: handleDelete(context),
              description: 'Permanently delete the external',
            },
          }),
        ];
      },
      getItems: async () => [
        await loadExternalVariableFolder({ extensionContext, current, projectId }),
        await loadExternalActionFolder({ extensionContext, current, projectId }),
        await loadExternalEventFolder({ extensionContext, current, projectId }),
        await loadExternalComponentFolder({ extensionContext, current, projectId }),
      ],
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(key => context.set('selected', key.includes(current.id)));

      return () => {
        selectionUnSubscription();
      }
    }
  })
}
