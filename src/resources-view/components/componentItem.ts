import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { action, component, Component, componentAction, componentEvent, componentListener, componentParameter, componentVariable, event, property } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadComponentParameter } from './parameter/componentParameter';
import { loadComponentVariable } from './variable/componentVariable';
import { loadComponentListener } from './listener/componentListener';
import { loadComponentAction } from './action/componentAction';
import { loadComponentEvent } from './event/componentEvent';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Component, 'id' | 'name' | 'description' | 'type'>;
};
export const loadComponentItem = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsParameterQuery = databaseHelper
    .select({
      name: property.name,
      id: componentParameter.id,
      type: componentParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: componentParameter.propertyId,
    })
    .from(componentParameter)
    .innerJoin(property, eq(property.id, componentParameter.propertyId))
    .where(eq(componentParameter.parentComponentId, current.id))
    .orderBy(asc(property.name));

  let itemsParameter = await loadItemsParameterQuery.execute() || [];

  const loadItemsVariableQuery = databaseHelper
    .select({
      name: property.name,
      id: componentVariable.id,
      type: componentVariable.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: componentVariable.propertyId,
    })
    .from(componentVariable)
    .innerJoin(property, eq(property.id, componentVariable.propertyId))
    .where(eq(componentVariable.parentComponentId, current.id))
    .orderBy(asc(property.name));

  let itemsVariable = await loadItemsVariableQuery.execute() || [];

  const loadItemsActionQuery = databaseHelper
    .select({
      name: action.name,
      id: componentAction.id,
      type: componentAction.type,
      description: action.description,
      actionId: componentAction.actionId,
    })
    .from(componentAction)
    .innerJoin(action, eq(action.id, componentAction.actionId))
    .where(eq(componentAction.parentComponentId, current.id))
    .orderBy(asc(action.name));

  let itemsAction = await loadItemsActionQuery.execute() || [];

  const loadItemsEventQuery = databaseHelper
    .select({
      name: event.name,
      id: componentEvent.id,
      type: componentEvent.type,
      description: event.description,
      eventId: componentEvent.eventId,
    })
    .from(componentEvent)
    .innerJoin(event, eq(event.id, componentEvent.eventId))
    .where(eq(componentEvent.parentComponentId, current.id))
    .orderBy(asc(event.name));

  let itemsEvent = await loadItemsEventQuery.execute() || [];

  const loadItemsListenerQuery = databaseHelper
    .select({
      id: componentListener.id,
      type: componentListener.type,
      name: componentListener.name,
    })
    .from(componentListener)
    .where(eq(componentListener.parentComponentId, current.id))
    .orderBy(asc(componentListener.name));

  let itemsListener = await loadItemsListenerQuery.execute() || [];


  const getAllItems = () => [
    ...itemsParameter,
    ...itemsVariable,
    ...itemsAction,
    ...itemsEvent,
    ...itemsListener,
  ];


  const handleAddParameter = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Component parameter name',
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
          .insert(componentParameter)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentComponentId: current.id,
          })
          .returning({ id: componentParameter.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }

  const handleAddVariable = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Component variable name',
      placeholder: 'Ex: ComponentVariable1',
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
          .insert(componentVariable)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentComponentId: current.id,
          })
          .returning({ id: componentVariable.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddAction = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Component action name',
      placeholder: 'Ex: ComponentAction1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    try {
      const id = await databaseHelper.transaction(async (trx) => {
        const [{ actionId }] = await trx
          .insert(action)
          .values({
            name: name,
            projectOwnerId: projectId,
          })
          .returning({ actionId: sql<string>`${action.id}`.as('actionId') });
        const [{ id }] = await trx
          .insert(componentAction)
          .values({
            actionId: actionId,
            projectOwnerId: projectId,
            parentComponentId: current.id,
          })
          .returning({ id: componentAction.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddEvent = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Component event name',
      placeholder: 'Ex: ComponentEvent1',
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
          .insert(componentEvent)
          .values({
            eventId: eventId,
            projectOwnerId: projectId,
            parentComponentId: current.id,
          })
          .returning({ id: componentEvent.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddListener = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Listener name',
      placeholder: 'Ex: Listener1',
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
          .insert(componentListener)
          .values({
            name: name,
            projectOwnerId: projectId,
            parentComponentId: current.id,
          })
          .returning({ id: componentListener.id });

        return id;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.delete(component).where(eq(component.id, current.id));
      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      label: current.name,
      icon: { path: 'component.svg' },
      children: getAllItems().length > 0,
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
            key: `${current.id}-add-parameter`,
            initialValue: {
              label: 'New parameter',
              action: handleAddParameter(context),
              icon: { path: 'component-parameter.svg' },
              description: 'Add a new component parameter',
            },
          }),
          new Action({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddVariable(context),
              icon: { path: 'component-variable.svg' },
              description: 'Add a new component variable',
            },
          }),
          new Action({
            key: `${current.id}-add-action`,
            initialValue: {
              label: 'New action',
              action: handleAddAction(context),
              icon: { path: 'component-action.svg' },
              description: 'Add a new component action',
            },
          }),
          new Action({
            key: `${current.id}-add-event`,
            initialValue: {
              label: 'New event',
              action: handleAddEvent(context),
              icon: { path: 'component-event.svg' },
              description: 'Add a new component event',
            },
          }),
          new Action({
            key: `${current.id}-add-listener`,
            initialValue: {
              label: 'New listener',
              action: handleAddListener(context),
              icon: { path: 'component-listener.svg' },
              description: 'Add a new component listener',
            },
          }),
          new Action({
            key: 'delete-folder',
            initialValue: {
              label: 'Delete folder',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the component',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', getAllItems().length > 0);

        return await Promise.all([
          ...itemsParameter.map(item => loadComponentParameter({
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
          ...itemsVariable.map(item => loadComponentVariable({
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
          ...itemsAction.map(item => loadComponentAction({
            projectId,
            extensionContext,
            current: {
              id: item.id,
              name: item.name,
              type: item.type,
              actionId: item.actionId,
              description: item.description,
            },
          })),
          ...itemsEvent.map(item => loadComponentEvent({
            projectId,
            extensionContext,
            current: {
              id: item.id,
              name: item.name,
              type: item.type,
              eventId: item.eventId,
              description: item.description,
            },
          })),
          ...itemsListener.map(item => loadComponentListener({
            projectId,
            extensionContext,
            current: {
              id: item.id,
              name: item.name,
              type: item.type,
            },
          })),
        ]);
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

      const [queryVariable, mapVariableResult] = mappableQuery(loadItemsVariableQuery)
      const itemsVariableUnSubscription = await extensionContext.data.subscribe({
        query: queryVariable,
        listener: async (data) => {
          itemsVariable = mapVariableResult(data);
          await context.refetchChildren();
        },
      });

      const [queryAction, mapActionResult] = mappableQuery(loadItemsActionQuery)
      const itemsActionUnSubscription = await extensionContext.data.subscribe({
        query: queryAction,
        listener: async (data) => {
          itemsAction = mapActionResult(data);
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

      const [queryListener, mapListenerResult] = mappableQuery(loadItemsListenerQuery)
      const itemsListenerUnSubscription = await extensionContext.data.subscribe({
        query: queryListener,
        listener: async (data) => {
          itemsListener = mapListenerResult(data);
          await context.refetchChildren();
        },
      });

      return () => {
        itemsParameterUnSubscription();
        itemsVariableUnSubscription();
        itemsListenerUnSubscription();
        itemsActionUnSubscription();
        itemsEventUnSubscription();
        selectionUnSubscription();
      }
    }
  })
}
