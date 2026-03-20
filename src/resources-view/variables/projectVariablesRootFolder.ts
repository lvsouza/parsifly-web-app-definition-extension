import { Action, DatabaseError, ListViewItem, TExtensionContext, TListItemMountContext } from 'parsifly-extension-base';
import { and, asc, eq, sql } from 'drizzle-orm';

import { createDatabaseHelper, mappableQuery } from '../../definition/DatabaseHelper';
import { folder, NewFolder, Project, projectVariable, property } from '../../definition/schema';
import { loadProjectVariableFolder } from './projectVariableFolder';
import { loadProjectVariable } from './projectVariable';


type TProps = {
  projectId: string;
  extensionContext: TExtensionContext;
  current: Pick<Project, 'id' | 'name' | 'description' | 'type'>;
};
export const projectVariablesRootFolder = async ({ extensionContext, current, projectId }: TProps) => {
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
    .where(eq(projectVariable.parentProjectId, current.id))
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
          eq(folder.parentProjectId, projectId),
        ))
    )
    .orderBy(asc(folder.type), asc(folder.name))

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
            parentProjectId: current.id,
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
      parentProjectId: current.id,
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
    key: `${current.id}-variables-group`,
    initialValue: {
      disableSelect: true,
      label: 'Variables',
      children: items.length > 0,
      icon: { path: 'project-variable-folder.svg' },
      onItemToggle: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-variables-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-variables-group`));
        }
      },
      onItemDoubleClick: async (context) => {
        const isOpen = !context.currentValue.opened;

        await context.set('opened', isOpen);

        if (isOpen) {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => [...(oldValue || []), `${current.id}-variables-group`]);
        } else {
          await extensionContext.localStorage.setItem<string[]>('OPENED_IDS', oldValue => (oldValue || []).filter(id => id !== `${current.id}-variables-group`));
        }
      },
      getContextMenuItems: async (context) => {
        return [
          new Action({
            key: `${current.id}-add-variable`,
            initialValue: {
              label: 'New variable',
              action: handleAddItem(context),
              icon: { path: 'project-variable.svg' },
              description: 'Add a new variable',
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
        ];
      },
      getItems: async (context) => {
        await context.set('children', items.length > 0);
        return await Promise.all(
          items.map(async item => {
            if (item.type === 'folder') return await loadProjectVariableFolder({ extensionContext, current: item, projectId });

            return await loadProjectVariable({
              extensionContext,
              projectId,
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
      const openedIds = await extensionContext.localStorage.getItem<string[]>('OPENED_IDS');
      await context.set('opened', openedIds ? openedIds.includes(`${current.id}-variables-group`) : context.currentValue.opened);

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
