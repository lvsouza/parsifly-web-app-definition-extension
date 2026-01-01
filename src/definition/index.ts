import { ProjectDescriptor, TApplication } from 'parsifly-extension-base';
import { Kysely, sql } from 'kysely'

import { EventLinkDialect } from './SQLDriver';
import { Database } from './DatabaseTypes';


export const dbQueryBuilder = new Kysely<Database>({ dialect: new EventLinkDialect() });


export const createDefinition = (_application: TApplication) => {
  return new ProjectDescriptor({
    version: 1,
    color: 'blue',
    key: 'web-app',
    name: 'Web App',
    type: 'web-app',
    icon: { type: 'page' },
    description: 'Aplicação web apenas frontend.',
    models: () => {
      return [
        {
          name: 'project',
          description: 'Store a the base properties of the project',
          properties: [
            { name: 'type', type: 'string', description: 'Type of the project', required: true },
            { name: 'id', type: 'number', description: 'Identifier of the project', required: true },
            { name: 'name', type: 'string', description: 'Unique name for the project', required: true },
            { name: 'description', type: 'string', description: 'A description for the project', required: false },
            { name: 'version', type: 'string', description: 'Version of the project', required: true },
            { name: 'public', type: 'boolean', description: '', required: true },
          ],
        },
      ];
    },
    migrations: () => [
      {
        order: 1,
        id: 'create-project-table',
        description: 'Create the project table',
        upQuery: () => dbQueryBuilder.schema
          .createTable('project')
          .addColumn('id', 'uuid', col => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`))
          .addColumn('name', 'varchar', col => col.notNull().unique())
          .addColumn('type', 'varchar', col => col.notNull().check(sql`type in ('web-app')`).defaultTo('web-app'))
          .addColumn('description', 'varchar')
          .addColumn('version', 'varchar', col => col.defaultTo('1.0.0'))
          .addColumn('public', 'boolean', col => col.defaultTo(false))
          .compile(),
      },
      {
        order: 2,
        id: 'create-project-item',
        description: 'Create the project item',
        upQuery: () => dbQueryBuilder
          .insertInto('project')
          .values({
            public: false,
            name: 'Unnamed',
            version: '1.0.0',
            description: 'Default description',
          })
          .compile(),
      }
    ],
  });
}


export const getHasAcceptableProject = async () => {
  try {
    const project = await dbQueryBuilder
      .selectFrom('project')
      .select('type')
      .executeTakeFirst();

    return project?.type === 'web-app';
  } catch (error) {
    return false;
  }
}

export const getResourceById = async (id: string) => {
  try {
    const result = await dbQueryBuilder
      .selectFrom([
        dbQueryBuilder.selectFrom('project').selectAll().where('id', '=', id).as('project'),
      ])
      .executeTakeFirst() as any

    return result?.project;
  } catch (error) {
    return null;
  }
}
