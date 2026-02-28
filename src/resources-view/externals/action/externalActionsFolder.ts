import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { External, externalAction } from '../../../definition/schema';
import { loadExternalAction } from './externalAction';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<External, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalActionFolder = async ({ extensionContext, current, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: externalAction.id,
      name: externalAction.name,
      type: externalAction.type,
      description: externalAction.description,
    })
    .from(externalAction)
    .where(eq(externalAction.parentExternalId, current.id))
    .orderBy(asc(externalAction.name));

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'External action name',
      placeholder: 'Ex: ExternalAction1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    try {
      const id = await databaseHelper.transaction(async (trx) => {
        const [{ id }] = await trx
          .insert(externalAction)
          .values({
            name,
            projectOwnerId: projectId,
            parentExternalId: current.id,
          })
          .returning({ id: externalAction.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }


  return new ListViewItem({
    key: `${current.id}-actions-group`,
    initialValue: {
      label: 'Actions',
      disableSelect: true,
      children: items.length > 0,
      icon: { path: 'external-action-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-actions-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-actions-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-actions-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-actions-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-action`,
            initialValue: {
              label: 'New action',
              action: handleAddItem(context),
              icon: { path: 'external-action.svg' },
              description: 'Add a new external action',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(items.map(item => loadExternalAction({ extensionContext, current: item, projectId })))
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${current.id}-actions-group`) : context.currentValue.opened);

      const [query, mapResult] = mappableQuery(loadItemsQuery)
      const itemsUnSubscription = await extensionContext.data.subscribe({
        query,
        listener: async (data) => {
          items = mapResult(data);
          await context.refetchChildren();
        },
      })

      return () => {
        itemsUnSubscription();
      }
    }
  })
}
