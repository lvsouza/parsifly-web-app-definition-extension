import { PgPreparedQuery, PgSession, PgTransaction, PgDialect, type PgQueryResultHKT, type PreparedQueryConfig, type PgTransactionConfig, PgDatabase, } from 'drizzle-orm/pg-core';
import { createTableRelationsHelpers, extractTablesRelationalConfig, ExtractTablesWithRelations, type RelationalSchemaConfig, type TablesRelationalConfig, } from 'drizzle-orm/relations';
import { fillPlaceholders, type Query, sql, } from 'drizzle-orm/sql';
import { type Cache, NoopCache } from 'drizzle-orm/cache/core';


export type RemoteExecutor = (args: { sql: string; parameters?: unknown[]; mode: 'array' | 'object'; }) => Promise<{ rows: unknown[] }>;

export interface RemoteQueryResultHKT extends PgQueryResultHKT {
  type: {
    rows: unknown[][];
  };
}

class RemotePgPreparedQuery<T extends PreparedQueryConfig> extends PgPreparedQuery<T> {
  constructor(
    private executor: RemoteExecutor,
    query: Query,
    _fields: any,
    _isArrayMode: boolean,
    cache: Cache = new NoopCache(),
    queryMetadata?: {
      type: 'select' | 'update' | 'delete' | 'insert';
      tables: string[];
    },
    private customResultMapper?: (rows: unknown[][]) => T['execute'],
  ) {
    super(query, cache, queryMetadata);
  }

  async execute(placeholderValues: Record<string, unknown> = {}): Promise<T['execute']> {
    const params = fillPlaceholders(this.query.params, placeholderValues);

    const useArrayMode = !!this.customResultMapper;

    const result = await this.executor({
      sql: this.query.sql,
      parameters: params,
      mode: useArrayMode ? 'array' : 'object',
    });

    if (this.customResultMapper) {
      return this.customResultMapper(result.rows as unknown[][]);
    }

    return result.rows as unknown as T['execute'];
  }

  async all(placeholderValues: Record<string, unknown> = {}): Promise<T['all']> {
    const params = fillPlaceholders(this.query.params, placeholderValues);

    const result = await this.executor({
      sql: this.query.sql,
      parameters: params,
      mode: 'array',
    });

    if (this.customResultMapper) {
      return this.customResultMapper(result.rows as unknown[][]) as T['all'];
    }

    return result.rows as T['all'];
  }
}

class RemotePgTransaction<TFullSchema extends Record<string, unknown>, TSchema extends TablesRelationalConfig,> extends PgTransaction<RemoteQueryResultHKT, TFullSchema, TSchema> {
  constructor(
    dialect: PgDialect,
    session: PgSession<any, TFullSchema, TSchema>,
    schema: RelationalSchemaConfig<TSchema> | undefined,
    nestedIndex = 0,
  ) {
    super(dialect, session, schema, nestedIndex);

    this._dialect = dialect;
    this._session = session;
    this._schema = schema;
  }

  private _dialect: PgDialect;
  private _session: PgSession<any, TFullSchema, TSchema>;
  private _schema: RelationalSchemaConfig<TSchema> | undefined;

  override async transaction<T>(transaction: (tx: RemotePgTransaction<TFullSchema, TSchema>) => Promise<T>): Promise<T> {
    const savepoint = `sp${this.nestedIndex + 1}`;

    const tx = new RemotePgTransaction<TFullSchema, TSchema>(
      this._dialect,
      this._session,
      this._schema,
      this.nestedIndex + 1,
    );

    await tx.execute(sql.raw(`SAVEPOINT ${savepoint}`));

    try {
      const result = await transaction(tx);

      await tx.execute(sql.raw(`RELEASE SAVEPOINT ${savepoint}`));

      return result;
    } catch (err) {
      await tx.execute(sql.raw(`ROLLBACK TO SAVEPOINT ${savepoint}`));
      throw err;
    }
  }
}

const dialect = new PgDialect({ casing: 'camelCase' });

class DrizzleRemoteDriverClient<TFullSchema extends Record<string, unknown> = Record<string, unknown>, TSchema extends TablesRelationalConfig = TablesRelationalConfig> extends PgSession<RemoteQueryResultHKT, TFullSchema, TSchema> {
  private cache: Cache = new NoopCache();

  constructor(
    private executor: RemoteExecutor,
    private schema: RelationalSchemaConfig<TSchema> | undefined,
  ) {
    super(dialect);
  }

  prepareQuery<T extends PreparedQueryConfig>(
    query: Query,
    fields: any,
    _name: string | undefined,
    isResponseInArrayMode: boolean,
    customResultMapper?: (rows: unknown[][]) => T['execute'],
    queryMetadata?: {
      type: 'select' | 'update' | 'delete' | 'insert';
      tables: string[];
    },
  ): PgPreparedQuery<T> {
    return new RemotePgPreparedQuery<T>(
      this.executor,
      query,
      fields,
      isResponseInArrayMode,
      this.cache,
      queryMetadata,
      customResultMapper,
    );
  }

  override async transaction<T>(
    transaction: (tx: RemotePgTransaction<TFullSchema, TSchema>) => Promise<T>,
    config?: PgTransactionConfig,
  ): Promise<T> {

    await this.executor({ sql: 'BEGIN', mode: 'object' });

    const tx = new RemotePgTransaction<TFullSchema, TSchema>(this.dialect, this, this.schema);

    if (config) {
      await tx.setTransaction(config);
    }

    try {
      const result = await transaction(tx);

      await this.executor({ sql: 'COMMIT', mode: 'object' });

      return result;
    } catch (err) {
      await this.executor({ sql: 'ROLLBACK', mode: 'object' });

      throw err;
    }
  }
}


export function drizzle<TFullSchema extends Record<string, unknown>>(
  executor: RemoteExecutor,
  config: { schema: TFullSchema },
): PgDatabase<RemoteQueryResultHKT, TFullSchema, ExtractTablesWithRelations<TFullSchema>> & { $client: RemoteExecutor } {
  const fullSchema = config.schema;

  const { tables, tableNamesMap } = extractTablesRelationalConfig(fullSchema, createTableRelationsHelpers);

  const relationalSchema: RelationalSchemaConfig<ExtractTablesWithRelations<TFullSchema>> = {
    fullSchema,
    tableNamesMap,
    schema: tables as any,
  };

  const session = new DrizzleRemoteDriverClient<TFullSchema, ExtractTablesWithRelations<TFullSchema>>(executor, relationalSchema);

  const db = new PgDatabase<RemoteQueryResultHKT, TFullSchema, ExtractTablesWithRelations<TFullSchema>>(dialect, session, relationalSchema);

  return Object.assign(db, { $client: executor });
}
