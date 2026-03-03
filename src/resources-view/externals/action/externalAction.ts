import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { externalAction, ExternalAction, externalActionOutput, externalActionParameter, property } from '../../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { loadExternalActionParameter } from './externalActionParameter';
import { loadExternalActionOutput } from './externalActionOutput';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<ExternalAction, 'id' | 'type' | 'name' | 'description'>;
};
export const loadExternalAction = async ({ extensionContext, current, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsParameterQuery = databaseHelper
    .select({
      name: property.name,
      id: externalActionParameter.id,
      type: externalActionParameter.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: externalActionParameter.propertyId,
    })
    .from(externalActionParameter)
    .innerJoin(property, eq(property.id, externalActionParameter.propertyId))
    .where(eq(externalActionParameter.parentExternalActionId, current.id))
    .orderBy(asc(property.name));

  let itemsParameter = await loadItemsParameterQuery.execute() || [];


  const loadItemsOutputQuery = databaseHelper
    .select({
      name: property.name,
      id: externalActionOutput.id,
      type: externalActionOutput.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: externalActionOutput.propertyId,
    })
    .from(externalActionOutput)
    .innerJoin(property, eq(property.id, externalActionOutput.propertyId))
    .where(eq(externalActionOutput.parentExternalActionId, current.id))
    .orderBy(asc(property.name));

  let itemsOutput = await loadItemsOutputQuery.execute() || [];


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
          .insert(externalActionParameter)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentExternalActionId: current.id,
          })
          .returning({ id: externalActionParameter.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }

  const handleAddItemOutput = (context: TListItemMountContext) => async () => {
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
          .insert(externalActionOutput)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentExternalActionId: current.id,
          })
          .returning({ id: externalActionOutput.id });

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
        await trx.delete(externalAction).where(eq(externalAction.id, current.id));
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
      children: itemsParameter.length > 0,
      icon: { path: 'external-action.svg' },
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
              action: handleAddItemParameter(context),
              icon: { path: 'external-parameter.svg' },
              description: 'Add a new external parameter',
            },
          }),
          new Action({
            key: `${current.id}-add-output`,
            initialValue: {
              label: 'New output',
              action: handleAddItemOutput(context),
              icon: { path: 'external-output.svg' },
              description: 'Add a new external output',
            },
          }),
          new Action({
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
        await context.set('children', itemsParameter.length > 0);

        return await Promise.all([
          ...itemsParameter.map(item => loadExternalActionParameter({
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
          ...itemsOutput.map(item => loadExternalActionOutput({
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

      const [queryOutput, mapOutputResult] = mappableQuery(loadItemsOutputQuery)
      const itemsOutputUnSubscription = await extensionContext.data.subscribe({
        query: queryOutput,
        listener: async (data) => {
          itemsOutput = mapOutputResult(data);
          await context.refetchChildren();
        },
      });

      return () => {
        selectionUnSubscription();
        itemsOutputUnSubscription();
        itemsParameterUnSubscription();
      };
    }
  })
}
