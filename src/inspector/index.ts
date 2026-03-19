import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { enumProperty, enumTable, enumValue, event, eventParameter, external, externalAction, externalActionOutput, externalActionParameter, externalComponent, externalComponentEvent, externalComponentParameter, externalComponentSlot, externalEvent, externalVariable, folder, project, projectEvent, projectVariable, structure, structureProperty } from '../definition/schema';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


const findById = async (extensionContext: TExtensionContext, id: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const tables = [
    project,
    folder,
    enumTable,
    enumProperty,
    enumValue,
    structure,
    external,
    externalVariable,
    externalAction,
    externalEvent,
    externalComponent,
  ];

  for (const table of tables) {
    const [result] = await databaseHelper
      .select({ id: table.id, type: table.type })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);

    if (result) return result;
  }

  // Usado para pegar uma "sub-propriedade" de uma entidade que tem propriedades com ligação em "property"
  const [structurePropertyResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${structureProperty.type.default})`);
  if (structurePropertyResult) return structurePropertyResult;

  const [externalVariableResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${externalVariable.type.default})`);
  if (externalVariableResult) return externalVariableResult;

  const [externalActionParameterResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${externalActionParameter.type.default})`);
  if (externalActionParameterResult) return externalActionParameterResult;

  const [externalActionOutputResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${externalActionOutput.type.default})`);
  if (externalActionOutputResult) return externalActionOutputResult;

  const [externalEventParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${eventParameter.type.default}) as found_property`)
    .innerJoin(eventParameter, eq(eventParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(externalEvent, eq(externalEvent.eventId, eventParameter.parentEventId));
  if (externalEventParameterResult) return { ...externalEventParameterResult, type: 'externalEventParameter' };

  const [externalComponentParameterResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${externalComponentParameter.type.default})`);
  if (externalComponentParameterResult) return externalComponentParameterResult;

  const [externalComponentSlotResult] = await databaseHelper
    .select({ id: sql<string>`"propertyId"`.as('id'), type: sql<string>`"rootEntityType"`.as('type') })
    .from(sql`get_property_belongs_to(${id}, ${externalComponentSlot.type.default})`);
  if (externalComponentSlotResult) return externalComponentSlotResult;

  const [externalComponentEventResult] = await databaseHelper
    .select({ id: event.id, type: externalComponentEvent.type })
    .from(externalComponentEvent)
    .innerJoin(event, eq(event.id, externalComponentEvent.eventId))
    .where(eq(event.id, id));
  if (externalComponentEventResult) return externalComponentEventResult;

  const [externalComponentEventParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${eventParameter.type.default}) as found_property`)
    .innerJoin(eventParameter, eq(eventParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(externalComponentEvent, eq(externalComponentEvent.eventId, eventParameter.parentEventId));
  if (externalComponentEventParameterResult) return { ...externalComponentEventParameterResult, type: 'externalComponentEventParameter' };

  const [projectEventResult] = await databaseHelper
    .select({ id: event.id, type: projectEvent.type })
    .from(projectEvent)
    .innerJoin(event, eq(event.id, projectEvent.eventId))
    .where(eq(event.id, id));
  if (projectEventResult) return projectEventResult;

  const [projectEventParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${eventParameter.type.default}) as found_property`)
    .innerJoin(eventParameter, eq(eventParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(projectEvent, eq(projectEvent.eventId, eventParameter.parentEventId));
  if (projectEventParameterResult) return { ...projectEventParameterResult, type: 'projectEventParameter' };

  const [projectVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${projectVariable.type.default}) as found_property`)
    .innerJoin(projectVariable, eq(projectVariable.id, sql`found_property."rootEntityId"`));
  if (projectVariableResult) return { ...projectVariableResult, type: 'projectVariable' };

  return null;
}


export const createInspectorView = (extensionContext: TExtensionContext) => {
  return new View({
    key: 'web-app-inspector',
    initialValue: {
      order: 0,
      title: 'Inspector',
      position: 'secondary',
      icon: { name: 'edit' },
      description: 'Web app properties',
      allowedPositions: ['primary', 'secondary', 'panel'],
      getViewContent: async () => new ViewContentForm({
        key: 'web-app-inspector-fields',
        initialValue: {
          getFields: async () => {
            const [selectionId] = await extensionContext.selection.get();
            if (!selectionId) return [];

            const item = await findById(extensionContext, selectionId);
            if (!item) return [];

            return await extensionContext.fields.get({
              targets: [{ id: item.id, kind: item.type }],
            });
          },
        },
        onDidMount: async (context) => {
          const unsubscribe = extensionContext.selection.subscribe(async () => await context.refetch());

          return async () => {
            unsubscribe();
          };
        },
      }),
    },
    onRequestOpen: async () => {
      await extensionContext.views.open({
        key: 'web-app-inspector'
      });
    },
  });
}
