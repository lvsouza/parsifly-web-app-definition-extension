import { Kysely, sql } from 'kysely'

import { createMigration } from '../MigrationHelper'
import { TMigration } from 'parsifly-extension-base'
import { Database } from '../DatabaseTypes'


export const _002_createNoSelfReferenceFunctionMigration = (databaseHelper: Kysely<Database>): TMigration[] => {
  return [
    createMigration('create-function-to-prevent-generic-deep-self-reference', () => {
      return sql`
      -- Create function
      CREATE OR REPLACE FUNCTION prevent_cycles_generic()
      RETURNS trigger AS $$
      DECLARE
        table_name text := TG_ARGV[0];
        id_column text := TG_ARGV[1];
        parent_column text := TG_ARGV[2];

        sql text;
        has_cycle boolean;
      BEGIN
        -- Se o parent for NULL, não há risco
        EXECUTE format(
          'SELECT ($1).%I IS NULL',
          parent_column
        )
        USING NEW
        INTO has_cycle;

        IF has_cycle THEN
          RETURN NEW;
        END IF;

        sql := format($sql$
          WITH RECURSIVE ancestors AS (
            SELECT %1$I AS id, %2$I AS parent_id
            FROM %3$I
            WHERE %1$I = ($1).%2$I

            UNION ALL

            SELECT t.%1$I, t.%2$I
            FROM %3$I t
            JOIN ancestors a ON t.%1$I = a.parent_id
          )
          CYCLE id SET is_cycle USING path
          SELECT EXISTS (
            SELECT 1
            FROM ancestors
            WHERE id = ($1).%1$I
              AND is_cycle IS FALSE
          )
        $sql$,
          id_column,
          parent_column,
          table_name
        );

        EXECUTE sql USING NEW INTO has_cycle;

        IF has_cycle THEN
          RAISE EXCEPTION
            USING
              ERRCODE = 'P1001',
              MESSAGE = format('Invalid hierarchy in %s', table_name),
              DETAIL = 'An entity cannot be moved into itself or one of its descendants',
              HINT = 'Choose a different parent';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `.compile(databaseHelper)
    }, 'Create the function to prevent generic self reference. It can be used in any table who can be self referenced.'),
  ]
}
