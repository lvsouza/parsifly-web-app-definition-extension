import { ViewContentForm, TExtensionContext, View } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { action, actionOutput, actionParameter, actionVariable, component, componentAction, componentEvent, componentListener, componentParameter, componentVariable, enumProperty, enumTable, enumValue, event, eventParameter, external, externalAction, externalActionOutput, externalActionParameter, externalComponent, externalComponentEvent, externalComponentParameter, externalComponentSlot, externalEvent, externalVariable, folder, page, pageAction, pageListener, pageParameter, pageVariable, project, projectAction, projectEvent, projectListener, projectVariable, structure, structureProperty } from '../definition/schema';
import { createDatabaseHelper } from '../definition/DatabaseHelper';


const findById = async (extensionContext: TExtensionContext, id: string) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const tables = [
    project,
    projectListener,
    folder,
    enumTable,
    enumProperty,
    enumValue,
    structure,
    component,
    componentListener,
    page,
    pageListener,
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

  const [projectActionResult] = await databaseHelper
    .select({ id: action.id, type: projectAction.type })
    .from(projectAction)
    .innerJoin(action, eq(action.id, projectAction.actionId))
    .where(eq(action.id, id));
  if (projectActionResult) return projectActionResult;

  const [projectActionParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionParameter.type.default}) as found_property`)
    .innerJoin(actionParameter, eq(actionParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(projectAction, eq(projectAction.actionId, actionParameter.parentActionId));
  if (projectActionParameterResult) return { ...projectActionParameterResult, type: 'projectActionParameter' };

  const [projectActionOutputResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionOutput.type.default}) as found_property`)
    .innerJoin(actionOutput, eq(actionOutput.id, sql`found_property."rootEntityId"`))
    .innerJoin(projectAction, eq(projectAction.actionId, actionOutput.parentActionId));
  if (projectActionOutputResult) return { ...projectActionOutputResult, type: 'projectActionOutput' };

  const [projectActionVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionVariable.type.default}) as found_property`)
    .innerJoin(actionVariable, eq(actionVariable.id, sql`found_property."rootEntityId"`))
    .innerJoin(projectAction, eq(projectAction.actionId, actionVariable.parentActionId));
  if (projectActionVariableResult) return { ...projectActionVariableResult, type: 'projectActionVariable' };


  const [componentEventResult] = await databaseHelper
    .select({ id: event.id, type: componentEvent.type })
    .from(componentEvent)
    .innerJoin(event, eq(event.id, componentEvent.eventId))
    .where(eq(componentEvent.id, id));
  if (componentEventResult) return componentEventResult;

  const [componentEventParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${eventParameter.type.default}) as found_property`)
    .innerJoin(eventParameter, eq(eventParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(componentEvent, eq(componentEvent.eventId, eventParameter.parentEventId));
  if (componentEventParameterResult) return { ...componentEventParameterResult, type: 'componentEventParameter' };

  const [componentVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${componentVariable.type.default}) as found_property`)
    .innerJoin(componentVariable, eq(componentVariable.id, sql`found_property."rootEntityId"`));
  if (componentVariableResult) return { ...componentVariableResult, type: 'componentVariable' };

  const [componentParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${componentParameter.type.default}) as found_property`)
    .innerJoin(componentParameter, eq(componentParameter.id, sql`found_property."rootEntityId"`));
  if (componentParameterResult) return { ...componentParameterResult, type: 'componentParameter' };

  const [componentActionResult] = await databaseHelper
    .select({ id: action.id, type: componentAction.type })
    .from(componentAction)
    .innerJoin(action, eq(action.id, componentAction.actionId))
    .where(eq(componentAction.id, id));
  if (componentActionResult) return componentActionResult;

  const [componentActionParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionParameter.type.default}) as found_property`)
    .innerJoin(actionParameter, eq(actionParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(componentAction, eq(componentAction.actionId, actionParameter.parentActionId));
  if (componentActionParameterResult) return { ...componentActionParameterResult, type: 'componentActionParameter' };

  const [componentActionOutputResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionOutput.type.default}) as found_property`)
    .innerJoin(actionOutput, eq(actionOutput.id, sql`found_property."rootEntityId"`))
    .innerJoin(componentAction, eq(componentAction.actionId, actionOutput.parentActionId));
  if (componentActionOutputResult) return { ...componentActionOutputResult, type: 'componentActionOutput' };

  const [componentActionVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionVariable.type.default}) as found_property`)
    .innerJoin(actionVariable, eq(actionVariable.id, sql`found_property."rootEntityId"`))
    .innerJoin(componentAction, eq(componentAction.actionId, actionVariable.parentActionId));
  if (componentActionVariableResult) return { ...componentActionVariableResult, type: 'componentActionVariable' };


  const [pageVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${pageVariable.type.default}) as found_property`)
    .innerJoin(pageVariable, eq(pageVariable.id, sql`found_property."rootEntityId"`));
  if (pageVariableResult) return { ...pageVariableResult, type: 'pageVariable' };

  const [pageParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${pageParameter.type.default}) as found_property`)
    .innerJoin(pageParameter, eq(pageParameter.id, sql`found_property."rootEntityId"`));
  if (pageParameterResult) return { ...pageParameterResult, type: 'pageParameter' };

  const [pageActionResult] = await databaseHelper
    .select({ id: action.id, type: pageAction.type })
    .from(pageAction)
    .innerJoin(action, eq(action.id, pageAction.actionId))
    .where(eq(pageAction.id, id));
  if (pageActionResult) return pageActionResult;

  const [pageActionParameterResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionParameter.type.default}) as found_property`)
    .innerJoin(actionParameter, eq(actionParameter.id, sql`found_property."rootEntityId"`))
    .innerJoin(pageAction, eq(pageAction.actionId, actionParameter.parentActionId));
  if (pageActionParameterResult) return { ...pageActionParameterResult, type: 'pageActionParameter' };

  const [pageActionOutputResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionOutput.type.default}) as found_property`)
    .innerJoin(actionOutput, eq(actionOutput.id, sql`found_property."rootEntityId"`))
    .innerJoin(pageAction, eq(pageAction.actionId, actionOutput.parentActionId));
  if (pageActionOutputResult) return { ...pageActionOutputResult, type: 'pageActionOutput' };

  const [pageActionVariableResult] = await databaseHelper
    .select({ id: sql<string>`found_property."propertyId"`.as('id') })
    .from(sql`get_property_belongs_to(${id}, ${actionVariable.type.default}) as found_property`)
    .innerJoin(actionVariable, eq(actionVariable.id, sql`found_property."rootEntityId"`))
    .innerJoin(pageAction, eq(pageAction.actionId, actionVariable.parentActionId));
  if (pageActionVariableResult) return { ...pageActionVariableResult, type: 'pageActionVariable' };

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
