import { Action, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { externalComponentSlot, ExternalComponentSlot, property, Property } from '../../../definition/schema';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Property, 'id' | 'name' | 'description'>;
  root: Pick<ExternalComponentSlot, 'id' | 'type' | 'propertyId'> & Pick<Property, 'name' | 'description'>;
};
export const loadExternalComponentSlot = async ({ extensionContext, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(externalComponentSlot).where(eq(externalComponentSlot.id, current.id));
        await trx.delete(property).where(eq(property.id, current.id));
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
      icon: { path: 'external-slot.svg' },
      description: current.description || '',
      onItemClick: async () => {
        await extensionContext.selection.select(current.id);
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: 'delete-slot',
            initialValue: {
              label: 'Delete slot',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the slot',
            },
          }),
        ];
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.id));

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.id)));

      return () => {
        selectionUnSubscription();
      }
    }
  })
}
