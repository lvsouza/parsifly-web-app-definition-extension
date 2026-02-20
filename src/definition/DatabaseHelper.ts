import { TExtensionContext, TQuery, TQueryResults } from 'parsifly-extension-base';
import { SelectedFields } from 'drizzle-orm';

import { drizzle, RemoteExecutor } from './DrizzleRemoteDriver';
import * as schema from './schema';


const handleRemoteCall = (extensionContext: TExtensionContext): RemoteExecutor => async ({ mode, sql, parameters }) => {
  try {
    const result = await extensionContext.data.execute({
      sql,
      mode,
      parameters: parameters || [],
    });

    if (!result) {
      throw new Error('Error on execute query in the client.');
    }

    const resultRows = result.rows ?? [];

    return { rows: resultRows };
  } catch (error) {
    throw error;
  }
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
export const createDatabaseHelper = (extensionContext: TExtensionContext) => {
  if (dbInstance) return dbInstance;

  dbInstance = drizzle(handleRemoteCall(extensionContext), { schema });

  return dbInstance;
};


type UnwrapArray<T> = T extends (infer U)[] ? U : T;

export interface QueryWithSelection<TResult, TSelection extends SelectedFields<any, any>> {
  execute: () => Promise<TResult>
  toSQL: () => { sql: string; params: unknown[] }
  _: {
    selectedFields: TSelection
  }
};

type TMappableResult<TResult, TSelection extends SelectedFields<any, any>> = [
  TQuery<UnwrapArray<NonNullable<TResult>>, 'array'>,
  (data: TQueryResults<Record<keyof TSelection, TSelection[string]['data']>, 'array'>) => TResult,
];

export const mappableQuery = <TResult, TSelection extends SelectedFields<any, any>>(query: QueryWithSelection<TResult, TSelection>): TMappableResult<TResult, TSelection> => {
  const { sql, params } = query.toSQL()

  const mappedQuery: TQuery<UnwrapArray<NonNullable<TResult>>, 'array'> = {
    sql,
    mode: 'array',
    parameters: params,
  }


  const selectionKeys = Object.keys(query._.selectedFields) as (keyof TSelection)[]

  const mapResult = (data: TQueryResults<Record<keyof TSelection, TSelection[string]['data']>, 'array'>): TResult => {
    const mapped = data.rows.map((row) => {
      const obj = {} as Record<keyof TSelection, unknown>

      selectionKeys.forEach((key, index) => {
        obj[key] = row[index]
      })

      return obj
    })

    return mapped as unknown as TResult
  }

  return [mappedQuery, mapResult]
};
