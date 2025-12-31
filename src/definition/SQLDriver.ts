import { Driver, CompiledQuery, QueryResult, Dialect, DatabaseConnection, PostgresIntrospector, PostgresAdapter, PostgresQueryCompiler, Kysely } from 'kysely';
import { EventLink } from 'parsifly-extension-base'


interface IEventLinkResult {
  rows: any[]
  rowsAffected: number
  lastInsertId?: number | string | null
}

export class EventLinkConnection implements DatabaseConnection {
  streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error("Stream not implemented for EventLink/PGlite bridge.");
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery

    const result = await EventLink.callStudioEvent('data:execute', { sql, parameters }) as IEventLinkResult
    if (!result) throw new Error('Error on execute query in the client.')

    const numAffectedRows = result.rowsAffected !== undefined && result.rowsAffected !== null
      ? BigInt(result.rowsAffected)
      : undefined

    const insertId = undefined

    return {
      rows: (result.rows ?? []) as O[],
      numAffectedRows,
      insertId,
    }
  }
}

export class EventLinkDriver implements Driver {
  async init(): Promise<void> { }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new EventLinkConnection()
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

export class EventLinkDialect implements Dialect {
  createAdapter() {
    return new PostgresAdapter()
  }

  createDriver() {
    return new EventLinkDriver()
  }

  createIntrospector(db: Kysely<any>) {
    return new PostgresIntrospector(db)
  }

  createQueryCompiler() {
    return new PostgresQueryCompiler()
  }
}