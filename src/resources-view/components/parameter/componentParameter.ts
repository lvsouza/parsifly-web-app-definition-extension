import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { asc, eq } from 'drizzle-orm';

import { componentParameter, ComponentParameter, NewProperty, property, Property } from '../../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../../definition/DatabaseHelper';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Property, 'id' | 'name' | 'description' | 'dataType'>;
  root: Pick<ComponentParameter, 'id' | 'type' | 'propertyId'> & Pick<Property, 'name' | 'description' | 'dataType'>;
};
export const loadComponentParameter = async ({ extensionContext, current, root, projectId }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const isRootLevel = root.propertyId === current.id;

  const loadItemsQuery = databaseHelper
    .select({
      id: property.id,
      name: property.name,
      dataType: property.dataType,
      description: property.description,
    })
    .from(property)
    .where(eq(property.parentPropertyId, current.id))
    .orderBy(asc(property.name));

  let items = await loadItemsQuery.execute() || [];


  const handleDelete = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.transaction(async (trx) => {
        await trx.delete(componentParameter).where(eq(componentParameter.id, current.id));
        await trx.delete(property).where(eq(property.id, current.id));
      });

      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }

  const handleCreateProperty = (context: TListItemMountContext) => async () => {
    const name = await extensionContext.quickPick.show<string>({
      title: 'Property name?',
      placeholder: 'Example: Property1',
      helpText: 'Type the name of the property.',
    });
    if (!name) return;

    await context.set('opened', true);

    const newItem: NewProperty = {
      name: name,
      description: '',
      required: false,
      dataType: 'string',
      id: crypto.randomUUID(),
      projectOwnerId: projectId,
      parentPropertyId: current.id,
    };

    try {
      const [insertedItem] = await databaseHelper.insert(property).values(newItem).returning({ id: property.id });
      await extensionContext.selection.select(insertedItem.id);
    } catch (error) {
      console.log(error);
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      label: current.name,
      children: items.length > 0,
      description: current.description || '',
      icon: isRootLevel ? { path: 'component-parameter.svg' } : { path: items.length > 0 ? 'component-property-group.svg' : 'component-property.svg' },
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
          ...(current.dataType === 'object' || current.dataType === 'array_object'
            ? [
              new Action({
                key: 'add-property',
                initialValue: {
                  label: 'New property',
                  action: handleCreateProperty(context),
                  icon: { path: 'component-property.svg' },
                  description: 'Creates a new property as child',
                },
              })
            ]
            : []
          ),
          new Action({
            key: 'delete-parameter',
            initialValue: {
              label: 'Delete parameter',
              icon: { path: 'delete.svg' },
              action: handleDelete(context),
              description: 'Permanently delete the parameter',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        await context.set('icon', isRootLevel ? { path: 'component-parameter.svg' } : { path: items.length > 0 ? 'component-property-group.svg' : 'component-property.svg' });
        return await Promise.all(
          items.map(async item => (
            await loadComponentParameter({
              root,
              projectId,
              current: item,
              extensionContext,
            })
          ))
        );
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get()
      await context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(current.id)));
      const [itemsQuery, mapItemsResult] = mappableQuery(loadItemsQuery);
      const itemsUnSubscription = await extensionContext.data.subscribe({
        query: itemsQuery,
        listener: async (result) => {
          items = mapItemsResult(result);
          await context.refetchChildren();
        },
      });

      return () => {
        itemsUnSubscription();
        selectionUnSubscription();
      }
    }
  })
}
