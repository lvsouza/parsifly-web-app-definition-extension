import { Action as ActionParsifly, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { projectAction, actionParameter, ProjectAction, action, Action, property, actionVariable, actionOutput } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadProjectActionParameter } from './projectActionParameter';
import { loadProjectActionVariable } from './projectActionVariable';
import { loadProjectActionOutput } from './projectActionOutput';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ProjectAction, 'id' | 'type' | 'actionId'> & Pick<Action, 'name' | 'description'>;
};
export const loadProjectAction = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const loadItemsQuery = databaseHelper
    .select({
      name: property.name,
      id: actionParameter.id,
      type: actionParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: sql<string>`${property.id}`.as('propertyId'),
    })
    .from(actionParameter)
    .innerJoin(property, eq(property.id, actionParameter.propertyId))
    .where(eq(actionParameter.parentActionId, current.actionId))
    .orderBy(asc(property.name))
    .unionAll(
      databaseHelper
        .select({
          name: property.name,
          id: actionVariable.id,
          type: actionVariable.type,
          dataType: property.dataType,
          description: property.description,
          propertyId: sql<string>`${property.id}`.as('propertyId'),
        })
        .from(actionVariable)
        .innerJoin(property, eq(property.id, actionVariable.propertyId))
        .where(eq(actionVariable.parentActionId, current.actionId))
        .orderBy(asc(property.name))
    )
    .unionAll(
      databaseHelper
        .select({
          name: property.name,
          id: actionOutput.id,
          type: actionOutput.type,
          dataType: property.dataType,
          description: property.description,
          propertyId: sql<string>`${property.id}`.as('propertyId'),
        })
        .from(actionOutput)
        .innerJoin(property, eq(property.id, actionOutput.propertyId))
        .where(eq(actionOutput.parentActionId, current.actionId))
        .orderBy(asc(property.name))
    );

  let items = await loadItemsQuery.execute() || [];


  const handleAddParameterItem = (context: TListItemMountContext) => async () => {
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

  const handleAddVariableItem = (context: TListItemMountContext) => async () => {
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

  const handleAddOutputItem = (context: TListItemMountContext) => async () => {
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
        await trx.delete(projectAction).where(eq(projectAction.id, current.id));
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
      children: items.length > 0,
      icon: { path: 'project-action.svg' },
      description: current.description || '',
      onItemClick: async () => {
        await extensionContext.selection.select(current.actionId);
      },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.actionId]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.actionId));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), current.actionId]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== current.actionId));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new ActionParsifly({
            key: `${current.id}-add-parameter`,
            initialValue: {
              label: 'New parameter',
              action: handleAddParameterItem(context),
              description: 'Add a new project parameter',
              icon: { path: 'project-action-parameter.svg' },
            },
          }),
          new ActionParsifly({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddVariableItem(context),
              description: 'Add a new project variable',
              icon: { path: 'project-action-variable.svg' },
            },
          }),
          new ActionParsifly({
            key: `${current.id}-add-output`,
            initialValue: {
              label: 'New output',
              action: handleAddOutputItem(context),
              description: 'Add a new project output',
              icon: { path: 'project-action-output.svg' },
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
        await context.set('children', items.length > 0);

        return await Promise.all(
          items.map(item => {
            if (item.type === 'actionParameter') return loadProjectActionParameter({
              projectId,
              root: item,
              extensionContext,
              current: {
                name: item.name,
                id: item.propertyId,
                dataType: item.dataType,
                description: item.description,
              },
            });

            if (item.type === 'actionVariable') return loadProjectActionVariable({
              projectId,
              root: item,
              extensionContext,
              current: {
                name: item.name,
                id: item.propertyId,
                dataType: item.dataType,
                description: item.description,
              },
            });

            if (item.type === 'actionOutput') return loadProjectActionOutput({
              projectId,
              root: item,
              extensionContext,
              current: {
                name: item.name,
                id: item.propertyId,
                dataType: item.dataType,
                description: item.description,
              },
            });

            throw new Error(`Type not found of "${item.type}" in project action`)
          })
        )
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.actionId));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.actionId) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.actionId)));

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
