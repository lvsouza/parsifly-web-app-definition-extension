import { Generated, Insertable, Selectable, Updateable } from 'kysely'


export interface Database {
  structureAttribute: StructureAttributeTable;
  component: ComponentTable;
  structure: StructureTable;
  project: ProjectTable;
  folder: FolderTable;
  action: ActionTable;
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

  parentStructureId: string | null;
  parentStructureAttributeId: string | null;
}

export type StructureAttribute = Selectable<StructureAttributeTable>;
export type NewStructureAttribute = Insertable<StructureAttributeTable>;
export type StructureAttributeUpdate = Updateable<StructureAttributeTable>;
