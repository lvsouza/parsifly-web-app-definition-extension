-- Create trigger for prevent self reference
CREATE TRIGGER property_no_cycles BEFORE INSERT
OR
UPDATE OF "parentPropertyId" ON "property" FOR EACH ROW WHEN (NEW."parentPropertyId" IS NOT NULL)
EXECUTE FUNCTION prevent_cycles_generic ('property', 'id', 'parentPropertyId');