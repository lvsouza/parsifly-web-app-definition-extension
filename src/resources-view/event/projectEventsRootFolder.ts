import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { projectEvent, event, NewFolder, folder } from '../../definition/schema';
import { loadProjectEventFolder } from './projectEventFolder';
import { loadProjectEvent } from './projectEvent';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
};
export const loadProjectEventsRootFolder = async ({ extensionContext, projectId }: TProps) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: projectEvent.id,
      name: event.name,
      type: projectEvent.type,
      description: event.description,
    })
    .from(projectEvent)
    .innerJoin(event, eq(event.id, projectEvent.eventId))
    .where(eq(projectEvent.parentProjectId, projectId))
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
          eq(folder.of, 'projectEvent'),
          eq(folder.parentProjectId, projectId),
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name))

  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Project event name',
      placeholder: 'Ex: ProjectEvent1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    try {
      const id = await databaseHelper.transaction(async (trx) => {
        const [{ eventId }] = await trx
          .insert(event)
          .values({
            name: name,
            projectOwnerId: projectId,
          })
          .returning({ eventId: sql<string>`${event.id}`.as('eventId') });
        await trx
          .insert(projectEvent)
          .values({
            eventId: eventId,
            projectOwnerId: projectId,
            parentProjectId: projectId,
          })
          .returning({ id: projectEvent.id });

        return eventId;
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
      of: 'projectEvent',
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
    key: `${projectId}-events-group`,
    initialValue: {
      label: 'Events',
      disableSelect: true,
      children: items.length > 0,
      icon: { path: 'project-event-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-events-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-events-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${projectId}-events-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${projectId}-events-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${projectId}-add-event`,
            initialValue: {
              label: 'New event',
              action: handleAddItem(context),
              icon: { path: 'project-event.svg' },
              description: 'Add a new project event',
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              description: 'Add a new folder',
              action: handleAddFolder(context),
              icon: { path: 'project-event-folder.svg' },
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadProjectEventFolder({ extensionContext, current: item, projectId });
            return await loadProjectEvent({ extensionContext, current: item, projectId });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${projectId}-events-group`) : context.currentValue.opened);

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
