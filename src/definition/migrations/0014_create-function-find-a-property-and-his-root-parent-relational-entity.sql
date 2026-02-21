CREATE
OR REPLACE FUNCTION "get_property_belongs_to" ("selectionId" uuid, "relationTable" text) RETURNS TABLE (
  "propertyId" uuid,
  "rootEntityId" uuid,
  "rootEntityType" text
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  "rootId" uuid;
  "query" text;
BEGIN
  IF to_regclass(quote_ident("relationTable")) IS NULL THEN
    RAISE EXCEPTION 'Table "%" does not exist or is not visible.', "relationTable";
  END IF;

  WITH RECURSIVE "propertyAncestors" AS (
    SELECT 
      "id", 
      "parentPropertyId", 
      ARRAY["id"] AS "visited_ids" 
    FROM "property"
    WHERE "id" = "selectionId"

    UNION ALL

    SELECT 
      "property"."id", 
      "property"."parentPropertyId", 
      "propertyAncestors"."visited_ids" || "property"."id" 
    FROM "property"
    INNER JOIN "propertyAncestors"
      ON "propertyAncestors"."parentPropertyId" = "property"."id"
    WHERE "property"."id" <> ALL("propertyAncestors"."visited_ids") 
  )
  SELECT "id"
  INTO "rootId"
  FROM "propertyAncestors"
  WHERE "parentPropertyId" IS NULL
  LIMIT 1;

  IF "rootId" IS NULL THEN
    RETURN;
  END IF;

  "query" := format(
    'SELECT $1, rel."id", rel."type"::text
     FROM %I rel
     WHERE rel."propertyId" = $2',
    "relationTable"
  );

  RETURN QUERY EXECUTE "query"
    USING "selectionId", "rootId";
END;
$$;