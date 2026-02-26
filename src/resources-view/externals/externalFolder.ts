import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, eq } from 'drizzle-orm';

import { external, Folder, folder, NewExternal, NewFolder } from '../../definition/schema';
import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { loadExternalItem } from './externalItem';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Folder, 'id' | 'name' | 'description' | 'type'>;
};
export const loadExternalFolder = async ({ extensionContext, projectId, current }: TProps): Promise<ListViewItem> => {
  const databaseHelper = createDatabaseHelper(extensionContext);


  const loadItemsQuery = databaseHelper
    .select({
      id: external.id,
      name: external.name,
      type: external.type,
      description: external.description,
    })
    .from(external)
    .where(eq(external.parentFolderId, current.id))
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
          eq(folder.parentFolderId, current.id),
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
      parentFolderId: current.id,
    };

    try {
      const [{ id }] = await databaseHelper.insert(external).values(newItem).returning({ id: folder.id });
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
      of: 'external',
      description: '',
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
      icon: { type: 'external-logic-folder' },
      onItemClick: async () => {
        await extensionContext.selection.select(current.id);
      },
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
          new Action({
            key: 'delete-folder',
            initialValue: {
              label: 'Delete folder',
              icon: { type: 'delete' },
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
            if (item.type === 'folder') return await loadExternalFolder({ extensionContext, current: item, projectId });
            return await loadExternalItem({ extensionContext, current: item, projectId });
          })
        );
      },
    },
    onDidMount: async (context) => {
      const selectionId = await extensionContext.selection.get();
      context.set('selected', selectionId.includes(current.id));

      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      context.set('opened', openedIds ? openedIds.includes(current.id) : context.currentValue.opened);

      const selectionUnSubscription = extensionContext.selection.subscribe(key => context.set('selected', key.includes(current.id)));

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
