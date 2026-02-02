import { TMigration } from 'parsifly-extension-base'

let order = 1;

export const createMigration = (id: TMigration['id'], upQuery: TMigration['upQuery'], description: TMigration['description']): TMigration => {
  const migrationOrder = ++order;

  return {
    upQuery,
    description,
    order: migrationOrder,
    id: `${migrationOrder}___${id}`,
  }
}
