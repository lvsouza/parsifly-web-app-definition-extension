import { Generated, Insertable, Selectable, Updateable } from 'kysely'


export interface Database {
  enumValueByAttribute: EnumValueByAttributeTable;
  structureAttribute: StructureAttributeTable;
  enumAttribute: EnumAttributeTable;
  component: ComponentTable;
  structure: StructureTable;
  enumValue: EnumValueTable;
  project: ProjectTable;
  folder: FolderTable;
  action: ActionTable;
  enum: EnumTable;
  page: PageTable;
}



export interface ProjectTable {
  id: Generated<string>;

  name: string;
  version: string;
  public: boolean;
  description: string | null;
  type: Generated<'webApp' | (string & {})>;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;



export interface FolderTable {
  id: Generated<string>;

  of: string;
  name: string;
  type: Generated<'folder' | (string & {})>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Folder = Selectable<FolderTable>;
export type NewFolder = Insertable<FolderTable>;
export type FolderUpdate = Updateable<FolderTable>;



export interface PageTable {
  id: Generated<string>;

  name: string;
  type: Generated<'page' | (string & {})>;
  public: Generated<boolean>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Page = Selectable<PageTable>;
export type NewPage = Insertable<PageTable>;
export type PageUpdate = Updateable<PageTable>;



export interface ComponentTable {
  id: Generated<string>;

  name: string;
  type: Generated<'component' | (string & {})>;
  public: Generated<boolean>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Component = Selectable<ComponentTable>;
export type NewComponent = Insertable<ComponentTable>;
export type ComponentUpdate = Updateable<ComponentTable>;



export interface ActionTable {
  id: Generated<string>;

  name: string;
  type: Generated<'action' | (string & {})>;
  public: Generated<boolean>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Action = Selectable<ActionTable>;
export type NewAction = Insertable<ActionTable>;
export type ActionUpdate = Updateable<ActionTable>;



export const VWebAppBasicDataType = [
  'string',
  'number',
  'boolean',
  'null',
] as const;

export type TWebAppBasicDataType = typeof VWebAppBasicDataType[number];

export interface EnumTable {
  id: Generated<string>;

  name: string;
  type: Generated<'enum' | (string & {})>;
  public: Generated<boolean>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Enum = Selectable<EnumTable>;
export type NewEnum = Insertable<EnumTable>;
export type EnumUpdate = Updateable<EnumTable>;

export interface EnumAttributeTable {
  id: Generated<string>;

  name: string;
  type: Generated<'enumAttribute' | (string & {})>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  dataType: TWebAppBasicDataType;
  required: Generated<boolean>;
  defaultValue: string | boolean | number | null;

  parentEnumId: string;
}

export type EnumAttribute = Selectable<EnumAttributeTable>;
export type NewEnumAttribute = Insertable<EnumAttributeTable>;
export type EnumAttributeUpdate = Updateable<EnumAttributeTable>;

export interface EnumValueTable {
  id: Generated<string>;

  name: string;
  type: Generated<'enumValue' | (string & {})>;
  createdAt: Generated<string>;

  projectOwnerId: string;
  parentEnumId: string;
}

export type EnumValue = Selectable<EnumValueTable>;
export type NewEnumValue = Insertable<EnumValueTable>;
export type EnumValueUpdate = Updateable<EnumValueTable>;

export interface EnumValueByAttributeTable {
  id: Generated<string>;

  type: Generated<'enumValueByAttribute' | (string & {})>;
  createdAt: Generated<string>;

  projectOwnerId: string;
  parentEnumValueId: string;
  parentEnumAttributeId: string;

  value: string | boolean | number | null;
}

export type EnumValueByAttributeAttribute = Selectable<EnumValueByAttributeTable>;
export type NewEnumValueByAttributeAttribute = Insertable<EnumValueByAttributeTable>;
export type EnumValueByAttributeAttributeUpdate = Updateable<EnumValueByAttributeTable>;



export const VWebAppDataType = [
  'structure',
  'string',
  'number',
  'boolean',
  'null',
  'object',
  'binary',
  'array_structure',
  'array_string',
  'array_number',
  'array_boolean',
  'array_null',
  'array_object',
  'array_binary',
] as const;

export type TWebAppDataType = typeof VWebAppDataType[number];

export interface StructureTable {
  id: Generated<string>;

  name: string;
  type: Generated<'structure' | (string & {})>;
  public: Generated<boolean>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Structure = Selectable<StructureTable>;
export type NewStructure = Insertable<StructureTable>;
export type StructureUpdate = Updateable<StructureTable>;

export interface StructureAttributeTable {
  id: Generated<string>;

  name: string;
  type: Generated<'structureAttribute' | (string & {})>;
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  dataType: TWebAppDataType;
  required: Generated<boolean>;
  defaultValue: string | boolean | number | null;
  referenceId: string | null;

  parentStructureId: string | null;
  parentStructureAttributeId: string | null;
}

export type StructureAttribute = Selectable<StructureAttributeTable>;
export type NewStructureAttribute = Insertable<StructureAttributeTable>;
export type StructureAttributeUpdate = Updateable<StructureAttributeTable>;
