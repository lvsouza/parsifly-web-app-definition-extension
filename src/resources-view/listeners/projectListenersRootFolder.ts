import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { folder, NewFolder, projectListener } from '../../definition/schema';
import { loadProjectListenerFolder } from './projectListenerFolder';
import { loadProjectListener } from './projectListener';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
};
export const projectListenersRootFolder = async ({ extensionContext, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: projectListener.id,
      name: projectListener.name,
      type: projectListener.type,
      description: sql<string | null>`null`.as('description'),
    })
    .from(projectListener)
    .where(eq(projectListener.parentProjectId, projectId))
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
          eq(folder.parentProjectId, projectId),
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name))

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
            parentProjectId: projectId,
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
      parentProjectId: projectId,
    };

    try {
      const [{ id }] = await databaseHelper.insert(folder).values(newItem).returning({ id: folder.id });
      await extensionContext.selection.select(id);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }


  return new ListViewItem({
    key: `${projectId}-listeners-group`,
    initialValue: {
      disableSelect: true,
      label: 'Listeners',
      children: items.length > 0,
      icon: { path: 'project-listener-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-listeners-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-listeners-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-listeners-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-listeners-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${projectId}-add-listener`,
            initialValue: {
              label: 'New listener',
              action: handleAddItem(context),
              icon: { path: 'project-listener.svg' },
              description: 'Add a new listener',
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
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${projectId}-listeners-group`) : context.currentValue.opened);

      const [query, mapResult] = mappableQuery(loadItemsQuery)
      const itemsUnSubscription = await extensionContext.data.subscribe({
        query,
        listener: async (data) => {
          items = mapResult(data);
          await context.refetchChildren();
        },
      });

      return () => {
        itemsUnSubscription();
      }
    }
  })
}
