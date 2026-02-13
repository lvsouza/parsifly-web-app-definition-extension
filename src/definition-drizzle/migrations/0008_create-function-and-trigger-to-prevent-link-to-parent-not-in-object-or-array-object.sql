-- Create function
CREATE
OR REPLACE FUNCTION validate_parent_property () RETURNS trigger AS $$
DECLARE
  parent_type text;
BEGIN
  -- Se não tem parent, não valida nada
  IF NEW."parentPropertyId" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT "dataType"
  INTO parent_type
  FROM "property"
  WHERE "id" = NEW."parentPropertyId";

  IF parent_type NOT IN ('object', 'array_object') THEN
    RAISE EXCEPTION
      USING
        MESSAGE = 'Invalid parent property dataType',
        DETAIL = 'Parent property must have dataType object or array_object',
        HINT = 'Choose an property with a compatible dataType';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER property_parent_check BEFORE INSERT
OR
UPDATE OF "parentPropertyId" ON "property" FOR EACH ROW
EXECUTE FUNCTION validate_parent_property ();