import { Action, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { projectListener, ProjectListener } from '../../definition/schema';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ProjectListener, 'id' | 'type' | 'name'>;
};
export const loadProjectListener = async ({ extensionContext, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(projectListener).where(eq(projectListener.id, current.id));
      });

      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      children: false,
      label: current.name,
      icon: { path: 'project-listener.svg' },
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
            key: 'delete-listener',
            initialValue: {
              label: 'Delete listener',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the listener',
            },
          }),
        ];
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.id));

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => {
        const isSelected = keys.includes(current.id);
        if (isSelected !== context.currentValue.selected) {
          await context.set('selected', isSelected);
        }
      });

      return () => {
        selectionUnSubscription();
      }
    }
  })
}
