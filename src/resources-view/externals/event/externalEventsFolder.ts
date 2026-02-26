import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { External, externalEvent, event } from '../../../definition/schema';
import { loadExternalEvent } from './externalEvent';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<External, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalEventFolder = async ({ extensionContext, current, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      name: event.name,
      id: externalEvent.id,
      type: externalEvent.type,
      description: event.description,
      eventId: externalEvent.eventId,
    })
    .from(externalEvent)
    .innerJoin(event, eq(event.id, externalEvent.eventId))
    .where(eq(externalEvent.parentExternalId, current.id));

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'External event name',
      placeholder: 'Ex: ExternalEvent1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    try {
      const id = await databaseHelper.transaction(async (trx) => {
        const [{ eventId }] = await trx
          .insert(event)
          .values({
            name: name,
            projectOwnerId: projectId,
          })
          .returning({ eventId: sql<string>`${event.id}`.as('eventId') });
        const [{ id }] = await trx
          .insert(externalEvent)
          .values({
            eventId: eventId,
            projectOwnerId: projectId,
            parentExternalId: current.id,
          })
          .returning({ id: externalEvent.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }


  return new ListViewItem({
    key: `${current.id}-events-group`,
    initialValue: {
      label: 'Events',
      disableSelect: true,
      children: items.length > 0,
      icon: { type: 'listen-only-event-folder' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-events-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-events-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-events-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-events-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-event`,
            initialValue: {
              label: 'New event',
              icon: { type: 'event-add' },
              action: handleAddItem(context),
              description: 'Add a new external event',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(items.map(item => loadExternalEvent({ extensionContext, current: item, projectId })))
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${current.id}-events-group`) : context.currentValue.opened);

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
