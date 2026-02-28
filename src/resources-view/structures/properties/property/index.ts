import { Action, DatabaseError, ListViewItem, TExtensionContext } from 'parsifly-extension-base';
import { asc, count, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { createDatabaseHelper, mappableQuery } from '../../../../definition/DatabaseHelper';
import { NewProperty, property } from '../../../../definition/schema';


const loadStructureProperties = async (extensionContext: TExtensionContext, projectId: string, id: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({ id: property.id })
    .from(property)
    .where(eq(property.parentPropertyId, id))
    .orderBy(asc(property.name));

  const properties = await Promise.all(items.map(item => loadStructureProperty(extensionContext, projectId, item.id)))

  return properties;
}

export const loadStructureProperty = async (extensionContext: TExtensionContext, projectId: string, id: string): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const child = alias(property, 'child')
  const [result] = await databaseHelper
    .select({
      id: property.id,
      name: property.name,
      description: property.description,
      childrenCount: count(child.id).as('childrenCount'),
    })
    .from(property)
    .leftJoin(child, eq(child.parentPropertyId, property.id))
    .where(eq(property.id, id))
    .groupBy(property.id)
    .limit(1);

  return new ListViewItem({
    key: result.id,
    initialValue: {
      label: result.name,
      children: result.childrenCount > 0,
      icon: result.childrenCount > 0 ? { path: 'structure-property-group.svg' } : { path: 'structure-property.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), result.id]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== result.id));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), result.id]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== result.id));
        }
      },
      onItemClick: async () => {
        await extensionContext.selection.select(result.id);
      },
      getItems: async (context) => {
        const items = await loadStructureProperties(extensionContext, projectId, result.id);
        await context.set('children', items.length > 0);
        await context.set('icon', items.length > 0 ? { path: 'structure-property-group.svg' } : { path: 'structure-property.svg' });
        return items;
      },
      getContextMenuItems: async (context) => {
        const [itemValue] = await databaseHelper
          .select({
            dataType: property.dataType,
          })
          .from(property)
          .where(eq(property.id, result.id))
          .limit(1);

        const actionNewProperty = new Action({
          key: `new-property:${result.id}`,
          initialValue: {
            label: 'New property',
            icon: { path: 'structure.svg' },
            description: 'Add to this item a new property',
            action: async () => {
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
                parentPropertyId: result.id,
              };

              try {
                const [insertedItem] = await databaseHelper.insert(property).values(newItem).returning({ id: property.id });
                await extensionContext.selection.select(insertedItem.id);
              } catch (error) {
                console.log(error);
                if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
                else throw error;
              }
            },
          },
        });

        return [
          ...(itemValue.dataType === 'object' || itemValue.dataType === 'array_object' ? [actionNewProperty] : []),
          new Action({
            key: `delete:${result.id}`,
            initialValue: {
              label: 'Delete',
              icon: { type: 'delete' },
              description: 'This action is irreversible',
              action: async () => {
                await databaseHelper.delete(property).where(eq(property.id, result.id));

                const selectionId = await extensionContext.selection.get();
                if (selectionId.includes(result.id)) extensionContext.selection.unselect(result.id);
              },
            },
          }),
        ];
      },
      //TODO: Ajustar no structure para receber  dragProvides: 'application/x.parsifly.property',
    },
    onDidMount: async (context) => {
      await context.set('label', result.name);
      await context.set('description', result.description || '');

      const selectionIds = await extensionContext.selection.get();
      await context.set('selected', selectionIds.includes(result.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(result.id) : context.currentValue.opened);

      const selectionSub = extensionContext.selection.subscribe(async keys => await context.set('selected', keys.includes(result.id)));

      const [itemsQuery] = mappableQuery(
        databaseHelper
          .select({ id: property.id })
          .from(property)
          .where(eq(property.parentPropertyId, result.id))
      );
      const itemsSub = await extensionContext.data.subscribe({
        query: itemsQuery,
        listener: () => context.refetchChildren(),
      });

      const [itemDetailQuery, itemDetailMapResult] = mappableQuery(
        databaseHelper
          .select({
            id: property.id,
            name: property.name,
            description: property.description,
          })
          .from(property)
          .where(eq(property.id, result.id))
      )
      const detailsSub = await extensionContext.data.subscribe({
        query: itemDetailQuery,
        listener: async (data) => {
          const [itemChanged] = itemDetailMapResult(data);
          await context.set('label', itemChanged.name || '');
          await context.set('description', itemChanged.description || '');
        },
      });

      return async () => {
        selectionSub();
        await itemsSub();
        await detailsSub();
      };
    },
  });
}
