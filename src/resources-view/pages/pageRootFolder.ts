import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { page, folder, NewPage, NewFolder } from '../../definition/schema';
import { loadPageFolder } from './pageFolder';
import { loadPageItem } from './pageItem';


export const loadPagesRootFolder = async (extensionContext: TExtensionContext, projectId: string, _parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: page.id,
      name: page.name,
      type: page.type,
      description: page.description,
    })
    .from(page)
    .where(eq(page.parentProjectId, projectId))
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
          eq(folder.of, 'page'),
          eq(folder.parentProjectId, projectId),
        ))
    )
    .orderBy(asc(page.name));


  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'Page name',
      placeholder: 'Ex: Page1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    const newItem: NewPage = {
      name: name,
      description: '',
      id: crypto.randomUUID(),
      projectOwnerId: projectId,
      parentProjectId: projectId,
    };

    try {
      await databaseHelper.insert(page).values(newItem);
      await extensionContext.selection.select(newItem.id!);
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
      of: 'page',
      description: '',
      id: crypto.randomUUID(),
      projectOwnerId: projectId,
      parentProjectId: projectId,
    };

    try {
      await databaseHelper.insert(folder).values(newItem);
      await extensionContext.selection.select(newItem.id!);
    } catch (error) {
      if (DatabaseError.as(error).code === '23505') extensionContext.feedback.error('Duplicated information')
      else throw error;
    }
  }


  return new ListViewItem({
    key: 'pages-group',
    initialValue: {
      label: 'Pages',
      disableSelect: true,
      children: items.length > 0,
      icon: { path: 'page-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'pages-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'pages-group'));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'pages-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'pages-group'));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: 'add-new-page',
            initialValue: {
              label: 'New Page',
              action: handleAddItem(context),
              icon: { path: 'page.svg' },
              description: 'Add a new page',
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              description: 'Add a new folder',
              action: handleAddFolder(context),
              icon: { path: 'page-folder.svg' },
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadPageFolder({ extensionContext, current: item, projectId });
            return await loadPageItem({ extensionContext, current: item, projectId });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes('pages-group') : context.currentValue.opened);

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
