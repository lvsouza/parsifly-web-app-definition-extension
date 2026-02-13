-- 1. Função para inserir em enumValueByProperty quando um novo enumProperty é criado
CREATE
OR REPLACE FUNCTION sync_enum_values_on_property_insert () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "enumValueByProperty" (
    "projectOwnerId",
    "parentEnumValueId",
    "parentEnumPropertyId"
  )
  SELECT
    NEW."projectOwnerId", -- Mantém o mesmo dono do projeto
    ev."id",              -- ID do valor de enum existente
    NEW."id"              -- ID do novo atributo criado
  FROM "enumValue" ev
  WHERE ev."parentEnumId" = NEW."parentEnumId" -- Apenas valores do mesmo Enum pai
  ON CONFLICT ("parentEnumValueId", "parentEnumPropertyId") DO NOTHING; -- Evita duplicatas se já existir

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger que dispara APÓS a criação de um enumProperty
CREATE TRIGGER trg_enum_property_insert
AFTER INSERT ON "enumProperty" FOR EACH ROW
EXECUTE FUNCTION sync_enum_values_on_property_insert ();