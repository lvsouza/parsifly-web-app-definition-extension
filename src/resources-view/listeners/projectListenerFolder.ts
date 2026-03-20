import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { Folder, folder, NewFolder, projectListener } from '../../definition/schema';
import { loadProjectListener } from './projectListener';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Folder, 'id' | 'name' | 'description' | 'type'>;
};
export const loadProjectListenerFolder = async ({ extensionContext, projectId, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: projectListener.id,
      name: projectListener.name,
      type: projectListener.type,
      description: sql<string | null>`null`.as('description'),
    })
    .from(projectListener)
    .where(eq(projectListener.parentFolderId, current.id))
    .unionAll(
      databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          type: folder.type,
          description: folder.description,
        })
        .from(folder)
        .where(and(
          eq(folder.of, 'projectListener'),
          eq(folder.parentFolderId, current.id),
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name));


  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
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
          .insert(projectListener)
          .values({
            name: name,
            projectOwnerId: projectId,
            parentFolderId: current.id,
          })
          .returning({ id: projectListener.id });

        return id;
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
      of: 'projectListener',
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
      icon: { path: 'project-listener-folder.svg' },
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
            key: 'add-new-project-listener',
            initialValue: {
              label: 'New listener',
              action: handleAddItem(context),
              description: 'Add a new listener',
              icon: { path: 'project-listener.svg' },
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              description: 'Add a new folder',
              action: handleAddFolder(context),
              icon: { path: 'project-listener-folder.svg' },
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
            if (item.type === 'folder') return await loadProjectListenerFolder({ extensionContext, current: item, projectId });
            return await loadProjectListener({
              projectId,
              extensionContext,
              current: {
                id: item.id,
                name: item.name,
                type: item.type,
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
