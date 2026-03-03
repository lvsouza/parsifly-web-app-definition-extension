import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { event, externalComponent, ExternalComponent, externalComponentEvent, externalComponentParameter, externalComponentSlot, property } from '../../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { loadExternalComponentParameter } from './externalComponentParameter';
import { loadExternalComponentEvent } from './externalComponentEvent';
import { loadExternalComponentSlot } from './externalComponentSlot';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ExternalComponent, 'id' | 'type' | 'name' | 'description'>;
};
export const loadExternalComponent = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsParameterQuery = databaseHelper
    .select({
      name: property.name,
      id: externalComponentParameter.id,
      type: externalComponentParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: externalComponentParameter.propertyId,
    })
    .from(externalComponentParameter)
    .innerJoin(property, eq(property.id, externalComponentParameter.propertyId))
    .where(eq(externalComponentParameter.parentExternalComponentId, current.id))
    .orderBy(asc(property.name));

  let itemsParameter = await loadItemsParameterQuery.execute() || [];


  const loadItemsSlotQuery = databaseHelper
    .select({
      name: property.name,
      id: externalComponentSlot.id,
      type: externalComponentSlot.type,
      description: property.description,
      propertyId: externalComponentSlot.propertyId,
    })
    .from(externalComponentSlot)
    .innerJoin(property, eq(property.id, externalComponentSlot.propertyId))
    .where(eq(externalComponentSlot.parentExternalComponentId, current.id))
    .orderBy(asc(property.name));

  let itemsSlot = await loadItemsSlotQuery.execute() || [];


  const loadItemsEventQuery = databaseHelper
    .select({
      name: event.name,
      id: externalComponentEvent.id,
      description: event.description,
      type: externalComponentEvent.type,
      eventId: sql<string>`${event.id}`.as('eventId'),
    })
    .from(externalComponentEvent)
    .innerJoin(event, eq(event.id, externalComponentEvent.eventId))
    .where(eq(externalComponentEvent.parentExternalComponentId, current.id))
    .orderBy(asc(event.name));

  let itemsEvent = await loadItemsEventQuery.execute() || [];


  const handleAddItemParameter = (context: TListItemMountContext) => async () => {
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
          .insert(externalComponentParameter)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentExternalComponentId: current.id,
          })
          .returning({ id: externalComponentParameter.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddItemSlot = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Slot name',
      placeholder: 'Ex: Slot1',
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
          .insert(externalComponentSlot)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentExternalComponentId: current.id,
          })
          .returning({ id: externalComponentSlot.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddItemEvent = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Event name',
      placeholder: 'Ex: Event1',
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
        await trx
          .insert(externalComponentEvent)
          .values({
            eventId: eventId,
            projectOwnerId: projectId,
            parentExternalComponentId: current.id,
          })
          .returning({ id: externalComponentEvent.id });

        return eventId;
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
      label: current.name,
      description: current.description || '',
      icon: { path: 'external-component.svg' },
      children: [...itemsParameter, ...itemsSlot].length > 0,
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
            key: `${current.id}-add-parameter`,
            initialValue: {
              label: 'New parameter',
              action: handleAddItemParameter(context),
              icon: { path: 'external-parameter.svg' },
              description: 'Add a new external parameter',
            },
          }),
          new Action({
            key: `${current.id}-add-slot`,
            initialValue: {
              label: 'New slot',
              action: handleAddItemSlot(context),
              icon: { path: 'external-slot.svg' },
              description: 'Add a new external slot',
            },
          }),
          new Action({
            key: `${current.id}-add-event`,
            initialValue: {
              label: 'New event',
              action: handleAddItemEvent(context),
              icon: { path: 'external-event.svg' },
              description: 'Add a new external event',
            },
          }),
          new Action({
            key: 'delete-component',
            initialValue: {
              label: 'Delete component',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the component',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', [...itemsParameter, ...itemsSlot, ...itemsEvent].length > 0);

        return await Promise.all([
          ...itemsParameter.map(item => loadExternalComponentParameter({
            projectId,
            root: item,
            extensionContext,
            current: {
              name: item.name,
              id: item.propertyId,
              dataType: item.dataType,
              description: item.description,
            },
          })),
          ...itemsSlot.map(item => loadExternalComponentSlot({
            projectId,
            root: item,
            extensionContext,
            current: {
              name: item.name,
              id: item.propertyId,
              description: item.description,
            },
          })),
          ...itemsEvent.map(item => loadExternalComponentEvent({
            projectId,
            root: item,
            extensionContext,
            current: {
              name: item.name,
              id: item.eventId,
              description: item.description,
            },
          })),
        ])
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.id)));


      const [queryParameter, mapParameterResult] = mappableQuery(loadItemsParameterQuery)
      const itemsParameterUnSubscription = await extensionContext.data.subscribe({
        query: queryParameter,
        listener: async (data) => {
          itemsParameter = mapParameterResult(data);
          await context.refetchChildren();
        },
      });

      const [querySlot, mapSlotResult] = mappableQuery(loadItemsSlotQuery)
      const itemsSlotUnSubscription = await extensionContext.data.subscribe({
        query: querySlot,
        listener: async (data) => {
          itemsSlot = mapSlotResult(data);
          await context.refetchChildren();
        },
      });

      const [queryEvent, mapEventResult] = mappableQuery(loadItemsEventQuery)
      const itemsEventUnSubscription = await extensionContext.data.subscribe({
        query: queryEvent,
        listener: async (data) => {
          itemsEvent = mapEventResult(data);
          await context.refetchChildren();
        },
      });

      return () => {
        selectionUnSubscription();
        itemsSlotUnSubscription();
        itemsEventUnSubscription();
        itemsParameterUnSubscription();
      };
    },
  })
}
