import { Driver, CompiledQuery, QueryResult, Dialect, DatabaseConnection, PostgresIntrospector, PostgresAdapter, PostgresQueryCompiler, Kysely } from 'kysely';
import { EventLink } from 'parsifly-extension-base'


// Interface para tipar o retorno do seu EventLink (ponte com o código anterior)
interface IEventLinkResult {
  rows: any[]
  rowsAffected: number
  lastInsertId?: number | string | null
}

export class EventLinkConnection implements DatabaseConnection {

  // PGlite suporta stream, mas via ponte (EventLink) é complexo. 
  // Manter "Not implemented" é seguro.
  streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error("Stream not implemented for EventLink/PGlite bridge.");
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery

    // Chama o evento que configuramos no passo anterior (data:execute)
    const result = await EventLink.callStudioEvent(
      'data:execute',
      { sql, parameters }
    ) as IEventLinkResult

    // Conversão de Tipos para o formato do Kysely
    const numAffectedRows = result.rowsAffected
      ? BigInt(result.rowsAffected)
      : undefined

    // NOTA: No Postgres, lastInsertId não é automático como no SQLite.
    // O Kysely precisa usar ".returning('id')" na query para obter o ID de volta nas 'rows'.
    // Mas se o seu executeSql tentar inferir, mapeamos aqui:
    const insertId = result.lastInsertId
      ? BigInt(result.lastInsertId)
      : undefined

    return {
      rows: (result.rows ?? []) as O[],
      numAffectedRows,
      insertId,
    }
  }
}

export class EventLinkDriver implements Driver {
  async init(): Promise<void> {
    // Inicialização é feita no lado do "Server/Main" (createProjectDb),
    // então aqui pode ficar vazio.
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new EventLinkConnection()
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> {
    // Nada a liberar já que a conexão é stateless via eventos
  }

  async beginTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('BEGIN'))
  }

  async commitTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('COMMIT'))
  }

  async rollbackTransaction(conn: EventLinkConnection): Promise<void> {
    await conn.executeQuery(CompiledQuery.raw('ROLLBACK'))
  }

  async destroy(): Promise<void> {
    // Destruição controlada externamente
  }
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
    // CRUCIAL: Isso garante que o Kysely gere parâmetros $1, $2, $3
    // que são compatíveis com o PGlite (ao contrário de ? do SQLite)
    return new PostgresQueryCompiler()
  }
}