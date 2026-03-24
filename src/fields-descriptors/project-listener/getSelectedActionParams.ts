import { FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { actionParameter, externalActionParameter, property } from '../../definition/schema';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


interface IGetProjectListenerSelectedActionParamsProps {
  eventId: string | null;
  actionId: string | null;
  extensionContext: TExtensionContext;
}
export const getSelectedActionParams = async ({ actionId, extensionContext }: IGetProjectListenerSelectedActionParamsProps) => {
  if (!actionId) return [];

  const databaseHelper = createDatabaseHelper(extensionContext);

  const results = await databaseHelper
    .select({
      name: property.name,
      id: actionParameter.id,
      type: actionParameter.type,
      required: property.required,
      description: property.description,
    })
    .from(actionParameter)
    .innerJoin(property, eq(property.id, actionParameter.propertyId))
    .where(eq(actionParameter.parentActionId, actionId))
    .unionAll(
      databaseHelper
        .select({
          name: property.name,
          id: externalActionParameter.id,
          type: externalActionParameter.type,
          required: property.required,
          description: property.description,
        })
        .from(externalActionParameter)
        .innerJoin(property, eq(property.id, externalActionParameter.propertyId))
        .where(eq(externalActionParameter.parentExternalActionId, actionId))
    )



  return results.map(actionParameter => (
    new FieldViewItem({
      key: `name:${actionParameter.id}`,
      initialValue: {
        name: 'name',
        error: undefined,
        type: 'expression',
        label: actionParameter.name,
        description: actionParameter.description || undefined,
        getValue: async () => {
          return '(click to edit)';
        },
        onDidClick: async () => {

        },
      },
    })
  ));
}

