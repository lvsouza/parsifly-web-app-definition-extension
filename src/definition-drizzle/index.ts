import { ProjectDescriptor, TExtensionContext, TMigration } from 'parsifly-extension-base';

import { createDatabaseHelper } from './DatabaseHelper';

const migrationFiles = import.meta.glob('./migrations/*.sql', {
  eager: true,
  query: '?raw',
  import: 'default'
})


export const createDefinition = (_: TExtensionContext) => {
  return new ProjectDescriptor({
    version: 1,
    color: 'blue',
    key: 'webApp_drizzle',
    name: 'Web App - Drizzle',
    type: 'webAppDrizzle',
    icon: { type: 'page' },
    description: 'Aplicação web apenas frontend.',
    models: () => {
      return [
        {
          name: 'project',
          description: 'Store a the base properties of the project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the project', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the project', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the project', required: true },
            { name: 'description', type: 'string', description: 'A description for the project', required: false },
            { name: 'version', type: 'string', description: 'Version of the project', required: true },
            { name: 'public', type: 'boolean', description: '', required: true },
          ],
        },
        {
          name: 'folder',
          description: 'Store a folder to organize recourses from a project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the folder', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the folder', required: true },
            { name: 'of', type: 'string', description: 'Where this folder is used', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the folder', required: true },
            { name: 'description', type: 'string', description: 'A description for the folder', required: false },
            { name: 'createdAt', type: 'string', description: 'Store the datetime of creation', required: true },
            { name: 'projectOwnerId', type: 'string', description: 'Store the project owner reference', required: true },
            { name: 'parentProjectId', type: 'string', description: 'Store the parent item reference', required: false },
            { name: 'parentFolderId', type: 'string', description: 'Store the parent item reference', required: false },
          ],
        },
        {
          name: 'page',
          description: 'Store a page to organize recourses from a project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the page', required: true },
            { name: 'id', type: 'string', description: 'Identifier of the page', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the page', required: true },
            { name: 'description', type: 'string', description: 'A description for the page', required: false },
            { name: 'public', type: 'boolean', description: '', required: true },
            { name: 'createdAt', type: 'string', description: 'Store the datetime of creation', required: true },
            { name: 'projectOwnerId', type: 'string', description: 'Store the project owner reference', required: true },
            { name: 'parentProjectId', type: 'string', description: 'Store the parent item reference', required: false },
            { name: 'parentFolderId', type: 'string', description: 'Store the parent item reference', required: false },
          ],
        },
      ];
    },
    migrations: () => {
      return Object
        .entries(migrationFiles)
        .map(([path, sql]) => {
          const fileName = path.split('/').pop()!
          const [orderRaw, ...nameParts] = fileName.replace('.sql', '').split('_')

          const order = Number(orderRaw)
          const name = nameParts.join('_')

          return {
            order,
            id: fileName,
            description: name,
            upQuery: () => ({
              parameters: [],
              sql: sql as string,
            })
          } satisfies TMigration
        })
        .sort((a, b) => a.order - b.order);
    },
  });
}

export const getHasAcceptableProject = async (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  try {
    const result = await databaseHelper.query.project.findFirst({
      columns: { projectType: true }
    });

    return result?.projectType === 'webApp';
  } catch (error) {
    return false;
  }
}
