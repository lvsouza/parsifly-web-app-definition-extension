import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { External, externalComponent } from '../../../definition/schema';
import { loadExternalComponent } from './externalComponent';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<External, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalComponentFolder = async ({ extensionContext, current, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: externalComponent.id,
      name: externalComponent.name,
      type: externalComponent.type,
      description: externalComponent.description,
    })
    .from(externalComponent)
    .where(eq(externalComponent.parentExternalId, current.id));

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'External component name',
      placeholder: 'Ex: ExternalComponent1',
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
          .insert(externalComponent)
          .values({
            name,
            projectOwnerId: projectId,
            parentExternalId: current.id,
            source: 'console.log("hello world")',
          })
          .returning({ id: externalComponent.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }


  return new ListViewItem({
    key: `${current.id}-components-group`,
    initialValue: {
      label: 'Components',
      disableSelect: true,
      children: items.length > 0,
      icon: { type: 'component-folder' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-components-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-components-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-components-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-components-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-component`,
            initialValue: {
              label: 'New component',
              action: handleAddItem(context),
              icon: { type: 'component-add' },
              description: 'Add a new external component',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(items.map(item => loadExternalComponent({ extensionContext, current: item, projectId })))
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${current.id}-components-group`) : context.currentValue.opened);

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
