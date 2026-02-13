import { TExtensionContext, TQuery, TQueryResults } from 'parsifly-extension-base';
import { PgPreparedQuery, PreparedQueryConfig } from 'drizzle-orm/pg-core';
import { drizzle, RemoteCallback } from 'drizzle-orm/pg-proxy';

import * as schema from './schema';


const handleRemoteCall = (extensionContext: TExtensionContext): RemoteCallback => async (sql, params, _method) => {
  try {
    // O Drizzle envia o SQL e os parâmetros separadamente
    const result = await extensionContext.data.execute({
      sql,
      parameters: params
    });

    if (!result) {
      throw new Error('Error on execute query in the client.');
    }

    // O Drizzle espera o retorno baseado no "method" (all ou execute)
    // Para Postgres Proxy, geralmente retornamos as linhas diretamente
    return {
      rows: result.rows ?? []
    };
  } catch (error) {
    throw error;
  }
}


export const createDatabaseHelper = (extensionContext: TExtensionContext) => {
  return drizzle(handleRemoteCall(extensionContext), {
    schema,
    casing: 'camelCase',
  });
}


type TMakeMappableQueryResult<T extends PgPreparedQuery<PreparedQueryConfig>> = [
  TQuery<NonNullable<Awaited<ReturnType<T['execute']>>>>,
  (data: TQueryResults<Record<string, any>>) => Awaited<ReturnType<T['execute']>>
]

export const makeMappableQuery = <T extends PreparedQueryConfig>(preparedQuery: PgPreparedQuery<T>): TMakeMappableQueryResult<PgPreparedQuery<T>> => {
  const query = preparedQuery.getQuery();

  return [
    { parameters: query.params, sql: query.sql },
    (data: TQueryResults<any>) => {
      return preparedQuery.mapResult(data.rows) as Awaited<ReturnType<typeof preparedQuery.execute>>;
    }
  ]
}
