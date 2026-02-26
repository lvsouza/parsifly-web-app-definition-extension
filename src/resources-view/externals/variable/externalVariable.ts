import { Action, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { externalVariable, ExternalVariable, property, Property } from '../../../definition/schema';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ExternalVariable, 'id' | 'type' | 'propertyId'> & Pick<Property, 'name' | 'description'>;
};
export const loadExternalVariable = async ({ extensionContext, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(externalVariable).where(eq(externalVariable.id, current.id));
        await trx.delete(property).where(eq(property.id, current.propertyId));
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
      icon: { type: 'variable-global' },
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
            key: 'delete-variable',
            initialValue: {
              label: 'Delete variable',
              icon: { type: 'delete' },
              action: handleDelete(context),
              description: 'Permanently delete the variable',
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
