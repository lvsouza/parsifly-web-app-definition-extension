import { Action, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { externalComponent, ExternalComponent } from '../../../definition/schema';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ExternalComponent, 'id' | 'type' | 'name' | 'description'>;
};
export const loadExternalComponent = async ({ extensionContext, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(externalComponent).where(eq(externalComponent.id, current.id));
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
      description: current.description || '',
      icon: { path: 'external-component.svg' },
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
            key: 'delete-component',
            initialValue: {
              label: 'Delete component',
              icon: { type: 'delete' },
              action: handleDelete(context),
              description: 'Permanently delete the component',
            },
          }),
        ];
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.id)));

      return () => {
        selectionUnSubscription();
      }
    }
  })
}
