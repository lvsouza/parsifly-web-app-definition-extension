import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, eq } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { external, folder, NewExternal, NewFolder } from '../../definition/schema';
import { loadExternalFolder } from './externalFolder';
import { loadExternalItem } from './externalItem';


export const loadExternalsRootFolder = async (extensionContext: TExtensionContext, projectId: string, _parentId: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: external.id,
      name: external.name,
      type: external.type,
      description: external.description,
    })
    .from(external)
    .where(eq(external.parentProjectId, projectId))
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
          eq(folder.of, 'external'),
          eq(folder.parentProjectId, projectId),
        ))
    );


  let items = await loadItemsQuery.execute() || [];


  const handleAddItem = (context: TListItemMountContext) => async () => {
    const name: string = await extensionContext.quickPick.show({
      title: 'External logic name',
      placeholder: 'Ex: ExternalLogic1',
    });
    if (!name) return;
    if (name.length < 3) {
      extensionContext.feedback.warning('Name must be a valid name');
      return;
    }

    await context.set('opened', true);

    const newItem: NewExternal = {
      name: name,
      description: '',
      id: crypto.randomUUID(),
      projectOwnerId: projectId,
      parentProjectId: projectId,
    };

    try {
      await databaseHelper.insert(external).values(newItem);
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
      of: 'external',
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
    key: 'externals-group',
    initialValue: {
      disableSelect: true,
      label: 'External logic',
      children: items.length > 0,
      icon: { type: 'external-logic-folder' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'externals-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'externals-group'));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), 'externals-group']);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== 'externals-group'));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: 'add-new-external',
            initialValue: {
              label: 'New External Logic',
              action: handleAddItem(context),
              icon: { type: 'external-logic-add' },
              description: 'Add a new external logic',
            },
          }),
          new Action({
            key: 'add-new-folder',
            initialValue: {
              label: 'New folder',
              icon: { type: 'folder-add' },
              description: 'Add a new folder',
              action: handleAddFolder(context),
            },
          }),
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadExternalFolder({ extensionContext, current: item, projectId });
            return await loadExternalItem({ extensionContext, current: item, projectId });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes('externals-group') : context.currentValue.opened);

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
