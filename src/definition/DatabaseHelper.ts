import { Driver, CompiledQuery, QueryResult, Dialect, DatabaseConnection, PostgresIntrospector, PostgresAdapter, PostgresQueryCompiler, Kysely } from 'kysely';
import { TExtensionContext } from 'parsifly-extension-base';

import { Database } from './DatabaseTypes';


class EventLinkConnection implements DatabaseConnection {
  constructor(private extensionContext: TExtensionContext) { }

  streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error("Stream not implemented for EventLink/PGlite bridge.");
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery

    try {
      const result = await this.extensionContext.data.execute({ sql, parameters });
      if (!result) throw new Error('Error on execute query in the client.');

      const numAffectedRows = result.affectedRows !== undefined && result.affectedRows !== null
        ? BigInt(result.affectedRows)
        : undefined

      const insertId = undefined

      return {
        rows: (result.rows ?? []) as O[],
        numAffectedRows,
        insertId,
      };
    } catch (error) {
      throw error;
    }
  }
}

class EventLinkDriver implements Driver {
  constructor(private extensionContext: TExtensionContext) { }

  async init(): Promise<void> { }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new EventLinkConnection(this.extensionContext)
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> { }

  async beginTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('BEGIN'))
  }

  async commitTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('COMMIT'))
  }

  async rollbackTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('ROLLBACK'))
  }

  async destroy(): Promise<void> { }
}

class EventLinkDialect implements Dialect {
  constructor(private extensionContext: TExtensionContext) { }

  createAdapter() {
    return new PostgresAdapter()
  }

  createDriver() {
    return new EventLinkDriver(this.extensionContext)
  }

  createIntrospector(db: Kysely<any>) {
    return new PostgresIntrospector(db)
  }

  createQueryCompiler() {
    return new PostgresQueryCompiler()
  }
}


export const createDatabaseHelper = (extensionContext: TExtensionContext) => {
  const dbQueryBuilder = new Kysely<Database>({ dialect: new EventLinkDialect(extensionContext) });
  return dbQueryBuilder;
}
