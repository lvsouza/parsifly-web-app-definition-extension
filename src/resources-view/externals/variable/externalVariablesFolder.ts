import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';
import { External, externalVariable, property } from '../../../definition/schema';
import { loadExternalVariable } from './externalVariable';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<External, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalVariableFolder = async ({ extensionContext, current, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      name: property.name,
      id: externalVariable.id,
      type: externalVariable.type,
      dataType: property.dataType,
      description: property.description,
      propertyId: externalVariable.propertyId,
    })
    .from(externalVariable)
    .innerJoin(property, eq(property.id, externalVariable.propertyId))
    .where(eq(externalVariable.parentExternalId, current.id))
    .orderBy(asc(property.name));

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'External variable name',
      placeholder: 'Ex: ExternalVariable1',
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
          .insert(externalVariable)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentExternalId: current.id,
          })
          .returning({ id: externalVariable.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }

  }


  return new ListViewItem({
    key: `${current.id}-variables-group`,
    initialValue: {
      disableSelect: true,
      label: 'Variables',
      children: items.length > 0,
      icon: { path: 'external-variable-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-variables-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-variables-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-variables-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-variables-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddItem(context),
              icon: { path: 'external-variable.svg' },
              description: 'Add a new external variable',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(item => loadExternalVariable({
            extensionContext,
            projectId,
            root: item,
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
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${current.id}-variables-group`) : context.currentValue.opened);

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
