import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { projectEvent, eventParameter, ProjectEvent, event, Event, property } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadProjectEventParameter } from './projectEventParameter';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ProjectEvent, 'id' | 'type' | 'eventId'> & Pick<Event, 'name' | 'description'>;
};
export const loadProjectEvent = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const loadItemsQuery = databaseHelper
    .select({
      name: property.name,
      id: eventParameter.id,
      type: eventParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: sql<string>`${property.id}`.as('propertyId'),
    })
    .from(eventParameter)
    .innerJoin(property, eq(property.id, eventParameter.propertyId))
    .where(eq(eventParameter.parentEventId, current.eventId))
    .orderBy(asc(property.name));

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Parameter name',
      placeholder: 'Ex: Parameter1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    try {
      const id = await databaseHelper.transaction(async (trx) => {
        const [{ propertyId }] = await trx
          .insert(property)
          .values({
            name: name,
            projectOwnerId: projectId,
          })
          .returning({ propertyId: sql<string>`${property.id}`.as('propertyId') });
        await trx
          .insert(eventParameter)
          .values({
            propertyId,
            projectOwnerId: projectId,
            parentEventId: current.eventId,
          })
          .returning({ id: eventParameter.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }

  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(projectEvent).where(eq(projectEvent.id, current.id));
        await trx.delete(event).where(eq(event.id, current.eventId));
      });

      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      label: current.name,
      children: items.length > 0,
      icon: { path: 'project-event.svg' },
      description: current.description || '',
      onItemClick: async () => {
        await extensionContext.selection.select(current.eventId);
      },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.eventId]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.eventId));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.eventId]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.eventId));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-parameter`,
            initialValue: {
              label: 'New parameter',
              action: handleAddItem(context),
              description: 'Add a new project parameter',
              icon: { path: 'project-event-parameter.svg' },
            },
          }),
          new Action({
            key: 'delete-event',
            initialValue: {
              label: 'Delete event',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the event',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);

        return await Promise.all(
          items.map(item => loadProjectEventParameter({
            projectId,
            root: item,
            extensionContext,
            current: {
              name: item.name,
              id: item.propertyId,
              dataType: item.dataType,
              description: item.description,
            },
          }))
        )
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.eventId));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.eventId) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.eventId)));

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
        selectionUnSubscription();
      }
    }
  })
}
