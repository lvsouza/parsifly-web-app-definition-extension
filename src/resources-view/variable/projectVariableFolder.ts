import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, eq, sql } from 'drizzle-orm';

import { property, Folder, folder, NewFolder, projectVariable } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadProjectVariable } from './projectVariable';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Folder, 'id' | 'name' | 'description' | 'type'>;
};
export const loadProjectVariableFolder = async ({ extensionContext, projectId, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: projectVariable.id,
      name: property.name,
      type: projectVariable.type,
      description: property.description,
      dataType: sql<string | null>`${property.dataType}`.as('dataType'),
      propertyId: sql<string | null>`${projectVariable.propertyId}`.as('propertyId'),
    })
    .from(projectVariable)
    .innerJoin(property, eq(property.id, projectVariable.propertyId))
    .where(eq(projectVariable.parentFolderId, current.id))
    .unionAll(
      databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          type: folder.type,
          description: folder.description,
          dataType: sql<string | null>`null`.as('dataType'),
          propertyId: sql<string | null>`null`.as('propertyId'),
        })
        .from(folder)
        .where(and(
          eq(folder.of, 'projectVariable'),
          eq(folder.parentFolderId, current.id),
        ))
    );


  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
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
          .insert(projectVariable)
          .values({
            propertyId: propertyId,
            projectOwnerId: projectId,
            parentFolderId: current.id,
          })
          .returning({ id: projectVariable.id });

        return propertyId;
      });

      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleAddFolder = (context: TListItemMountContext) => async () => {
    const name = await extensionContext.quickPick.show<string>({
      title: 'Folder name',
      placeholder: 'Example: Folder1',
      helpText: 'Type the name of the folder.',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    const newItem: NewFolder = {
      name: name,
      description: '',
      of: 'projectVariable',
      id: crypto.randomUUID(),
      projectOwnerId: projectId,
      parentFolderId: current.id,
    };

    try {
      const [{ id }] = await databaseHelper.insert(folder).values(newItem).returning({ id: folder.id });
      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }

  const handleDeleteFolder = (_context: TListItemMountContext) => async () => {
    try {
      await databaseHelper.delete(folder).where(eq(folder.id, current.id));
      await extensionContext.selection.unselect(current.id);
    } catch (error) {
      throw error;
    }
  }


  return new ListViewItem({
    key: current.id,
    initialValue: {
      children: true,
      label: current.name,
      description: current.description || '',
      icon: { path: 'project-variable-folder.svg' },
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
            key: 'add-new-project-variable',
            initialValue: {
              label: 'New variable',
              action: handleAddItem(context),
              description: 'Add a new variable',
              icon: { path: 'project-variable.svg' },
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              description: 'Add a new folder',
              action: handleAddFolder(context),
              icon: { path: 'project-variable-folder.svg' },
            },
          }),
          new Action({
            key: 'delete-folder',
            initialValue: {
              label: 'Delete folder',
              icon: { path: 'delete.svg' },
              action: handleDeleteFolder(context),
              description: 'Permanently delete the folder',
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadProjectVariableFolder({ extensionContext, current: item, projectId });
            return await loadProjectVariable({
              projectId,
              extensionContext,
              root: {
                id: item.id,
                name: item.name,
                type: item.type,
                description: item.description,
                dataType: item.dataType as 'string',
                propertyId: item.propertyId as string,
              },
              current: {
                name: item.name,
                id: item.propertyId as string,
                description: item.description,
              },
            });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get();
      await context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(async keys => {
        const isSelected = keys.includes(current.id);
        if (isSelected !== context.currentValue.selected) {
          await context.set('selected', isSelected);
        }
      });

      const [query, mapResult] = mappableQuery(loadItemsQuery);
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
