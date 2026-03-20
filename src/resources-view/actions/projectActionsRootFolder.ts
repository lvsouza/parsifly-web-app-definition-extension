import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { projectAction, action, NewFolder, folder } from '../../definition/schema';
import { loadProjectActionFolder } from './projectActionFolder';
import { loadProjectAction } from './projectAction';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
};
export const loadProjectActionsRootFolder = async ({ extensionContext, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: projectAction.id,
      name: action.name,
      type: projectAction.type,
      description: action.description,
      actionId: sql<string | null>`${projectAction.actionId}`.as('actionId'),
    })
    .from(projectAction)
    .innerJoin(action, eq(action.id, projectAction.actionId))
    .where(eq(projectAction.parentProjectId, projectId))
    .unionAll(
      databaseHelper
        .select({
          id: folder.id,
          name: folder.name,
          type: folder.type,
          description: folder.description,
          actionId: sql<string | null>`null`.as('actionId'),
        })
        .from(folder)
        .where(and(
          eq(folder.of, 'projectAction'),
          eq(folder.parentProjectId, projectId),
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name))

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Action name',
      placeholder: 'Ex: Action1',
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
        await trx
          .insert(projectAction)
          .values({
            actionId: actionId,
            projectOwnerId: projectId,
            parentProjectId: projectId,
          })
          .returning({ id: projectAction.id });

        return actionId;
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
      of: 'projectAction',
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
    key: `${projectId}-actions-group`,
    initialValue: {
      label: 'Actions',
      disableSelect: true,
      children: items.length > 0,
      icon: { path: 'project-action-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-actions-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-actions-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-actions-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-actions-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${projectId}-add-action`,
            initialValue: {
              label: 'New action',
              action: handleAddItem(context),
              icon: { path: 'project-action.svg' },
              description: 'Add a new project action',
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              description: 'Add a new folder',
              action: handleAddFolder(context),
              icon: { path: 'project-action-folder.svg' },
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadProjectActionFolder({ extensionContext, current: item, projectId });
            return await loadProjectAction({
              projectId,
              extensionContext,
              current: {
                id: item.id,
                name: item.name,
                type: item.type,
                description: item.description,
                actionId: item.actionId as string,
              },
            });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${projectId}-actions-group`) : context.currentValue.opened);

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
