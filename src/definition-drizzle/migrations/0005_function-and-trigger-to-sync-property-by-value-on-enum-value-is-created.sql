-- 1. Função para inserir em enumValueByProperty quando um novo enumValue é criado
CREATE
OR REPLACE FUNCTION sync_enum_properties_on_value_insert () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "enumValueByProperty" (
    "projectOwnerId",
    "parentEnumValueId",
    "parentEnumPropertyId"
  )
  SELECT
    NEW."projectOwnerId", -- Mantém o mesmo dono do projeto
    NEW."id",             -- ID do novo valor de enum criado
    ea."id"               -- ID do propriedade existente
  FROM "enumProperty" ea
  WHERE ea."parentEnumId" = NEW."parentEnumId" -- Apenas propriedades do mesmo Enum pai
  ON CONFLICT ("parentEnumValueId", "parentEnumPropertyId") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger que dispara APÓS a criação de um enumValue
CREATE TRIGGER trg_enum_value_insert
AFTER INSERT ON "enumValue" FOR EACH ROW
EXECUTE FUNCTION sync_enum_properties_on_value_insert ();