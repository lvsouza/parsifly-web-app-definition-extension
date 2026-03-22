import { Action as ActionParsifly, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { pageAction, actionParameter, PageAction, action, Action, property, actionOutput, actionVariable } from '../../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { loadPageActionParameter } from './pageActionParameter';
import { loadPageActionVariable } from './pageActionVariable';
import { loadPageActionOutput } from './pageActionOutput';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<PageAction, 'id' | 'type' | 'actionId'> & Pick<Action, 'name' | 'description'>;
};
export const loadPageAction = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsParameterQuery = databaseHelper
    .select({
      name: property.name,
      id: actionParameter.id,
      type: actionParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: actionParameter.propertyId,
    })
    .from(actionParameter)
    .innerJoin(property, eq(property.id, actionParameter.propertyId))
    .where(eq(actionParameter.parentActionId, current.actionId))
    .orderBy(asc(property.name));

  let itemsParameter = await loadItemsParameterQuery.execute() || [];

  const loadItemsVariableQuery = databaseHelper
    .select({
      name: property.name,
      id: actionVariable.id,
      type: actionVariable.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: actionVariable.propertyId,
    })
    .from(actionVariable)
    .innerJoin(property, eq(property.id, actionVariable.propertyId))
    .where(eq(actionVariable.parentActionId, current.actionId))
    .orderBy(asc(property.name));

  let itemsVariable = await loadItemsVariableQuery.execute() || [];

  const loadItemsOutputQuery = databaseHelper
    .select({
      name: property.name,
      id: actionOutput.id,
      type: actionOutput.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: actionOutput.propertyId,
    })
    .from(actionOutput)
    .innerJoin(property, eq(property.id, actionOutput.propertyId))
    .where(eq(actionOutput.parentActionId, current.actionId))
    .orderBy(asc(property.name));

  let itemsOutput = await loadItemsOutputQuery.execute() || [];

  const getAllItems = () => [
    ...itemsParameter,
    ...itemsVariable,
    ...itemsOutput,
  ];


  const handleAddParameter = (context: TListItemMountContext) => async () => {
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
          .insert(actionParameter)
          .values({
            propertyId,
            projectOwnerId: projectId,
            parentActionId: current.actionId,
          })
          .returning({ id: actionParameter.id });

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
      title: 'Variable name',
      placeholder: 'Ex: Variable1',
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
          .insert(actionVariable)
          .values({
            propertyId,
            projectOwnerId: projectId,
            parentActionId: current.actionId,
          })
          .returning({ id: actionVariable.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }

  const handleAddOutput = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Output name',
      placeholder: 'Ex: Output1',
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
          .insert(actionOutput)
          .values({
            propertyId,
            projectOwnerId: projectId,
            parentActionId: current.actionId,
          })
          .returning({ id: actionOutput.id });

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
        await trx.delete(pageAction).where(eq(pageAction.id, current.id));
        await trx.delete(action).where(eq(action.id, current.actionId));
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
      children: getAllItems().length > 0,
      icon: { path: 'page-action.svg' },
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
          new ActionParsifly({
            key: `${current.id}-add-parameter`,
            initialValue: {
              label: 'New parameter',
              action: handleAddParameter(context),
              icon: { path: 'page-parameter.svg' },
              description: 'Add a new page parameter',
            },
          }),
          new ActionParsifly({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddVariable(context),
              icon: { path: 'page-variable.svg' },
              description: 'Add a new page variable',
            },
          }),
          new ActionParsifly({
            key: `${current.id}-add-output`,
            initialValue: {
              label: 'New output',
              action: handleAddOutput(context),
              icon: { path: 'page-output.svg' },
              description: 'Add a new page output',
            },
          }),
          new ActionParsifly({
            key: 'delete-action',
            initialValue: {
              label: 'Delete action',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the action',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', getAllItems().length > 0);

        return await Promise.all([
          ...itemsParameter.map(item => loadPageActionParameter({
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
          ...itemsVariable.map(item => loadPageActionVariable({
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
          ...itemsOutput.map(item => loadPageActionOutput({
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

      const [queryOutput, mapOutputResult] = mappableQuery(loadItemsOutputQuery)
      const itemsOutputUnSubscription = await extensionContext.data.subscribe({
        query: queryOutput,
        listener: async (data) => {
          itemsOutput = mapOutputResult(data);
          await context.refetchChildren();
        },
      });

      return () => {
        itemsParameterUnSubscription();
        itemsVariableUnSubscription();
        itemsOutputUnSubscription();
        selectionUnSubscription();
      }
    }
  })
}
