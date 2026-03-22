import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { action, page, Page, pageAction, pageListener, pageParameter, pageVariable, property } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadPageParameter } from './parameter/pageParameter';
import { loadPageVariable } from './variable/pageVariable';
import { loadPageListener } from './listener/pageListener';
import { loadPageAction } from './action/pageAction';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Page, 'id' | 'name' | 'description' | 'type'>;
};
export const loadPageItem = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsParameterQuery = databaseHelper
    .select({
      name: property.name,
      id: pageParameter.id,
      type: pageParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: pageParameter.propertyId,
    })
    .from(pageParameter)
    .innerJoin(property, eq(property.id, pageParameter.propertyId))
    .where(eq(pageParameter.parentPageId, current.id))
    .orderBy(asc(property.name));

  let itemsParameter = await loadItemsParameterQuery.execute() || [];

  const loadItemsVariableQuery = databaseHelper
    .select({
      name: property.name,
      id: pageVariable.id,
      type: pageVariable.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: pageVariable.propertyId,
    })
    .from(pageVariable)
    .innerJoin(property, eq(property.id, pageVariable.propertyId))
    .where(eq(pageVariable.parentPageId, current.id))
    .orderBy(asc(property.name));

  let itemsVariable = await loadItemsVariableQuery.execute() || [];

  const loadItemsActionQuery = databaseHelper
    .select({
      name: action.name,
      id: pageAction.id,
      type: pageAction.type,
      description: action.description,
      actionId: pageAction.actionId,
    })
    .from(pageAction)
    .innerJoin(action, eq(action.id, pageAction.actionId))
    .where(eq(pageAction.parentPageId, current.id))
    .orderBy(asc(action.name));

  let itemsAction = await loadItemsActionQuery.execute() || [];

  const loadItemsListenerQuery = databaseHelper
    .select({
      id: pageListener.id,
      type: pageListener.type,
      name: pageListener.name,
    })
    .from(pageListener)
    .where(eq(pageListener.parentPageId, current.id))
    .orderBy(asc(pageListener.name));

  let itemsListener = await loadItemsListenerQuery.execute() || [];


  const getAllItems = () => [
    ...itemsParameter,
    ...itemsVariable,
    ...itemsAction,
    ...itemsListener,
  ];


  const handleAddParameter = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Page parameter name',
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
          .insert(pageParameter)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentPageId: current.id,
          })
          .returning({ id: pageParameter.id });

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
      title: 'Page variable name',
      placeholder: 'Ex: PageVariable1',
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
          .insert(pageVariable)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentPageId: current.id,
          })
          .returning({ id: pageVariable.id });

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
      title: 'Page action name',
      placeholder: 'Ex: PageAction1',
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
          .insert(pageAction)
          .values({
            actionId: actionId,
            projectOwnerId: projectId,
            parentPageId: current.id,
          })
          .returning({ id: pageAction.id });

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
          .insert(pageListener)
          .values({
            name: name,
            projectOwnerId: projectId,
            parentPageId: current.id,
          })
          .returning({ id: pageListener.id });

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
      await databaseHelper.delete(page).where(eq(page.id, current.id));
      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      label: current.name,
      icon: { path: 'page.svg' },
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
              icon: { path: 'page-parameter.svg' },
              description: 'Add a new page parameter',
            },
          }),
          new Action({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddVariable(context),
              icon: { path: 'page-variable.svg' },
              description: 'Add a new page variable',
            },
          }),
          new Action({
            key: `${current.id}-add-action`,
            initialValue: {
              label: 'New action',
              action: handleAddAction(context),
              icon: { path: 'page-action.svg' },
              description: 'Add a new page action',
            },
          }),
          new Action({
            key: `${current.id}-add-listener`,
            initialValue: {
              label: 'New listener',
              action: handleAddListener(context),
              icon: { path: 'page-listener.svg' },
              description: 'Add a new page listener',
            },
          }),
          new Action({
            key: 'delete-folder',
            initialValue: {
              label: 'Delete folder',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the page',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', getAllItems().length > 0);

        return await Promise.all([
          ...itemsParameter.map(item => loadPageParameter({
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
          ...itemsVariable.map(item => loadPageVariable({
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
          ...itemsAction.map(item => loadPageAction({
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
          ...itemsListener.map(item => loadPageListener({
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
        selectionUnSubscription();
      }
    }
  })
}
