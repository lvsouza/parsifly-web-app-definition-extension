import { Generated, Insertable, Selectable, Updateable } from 'kysely'


export interface Database {
  component: ComponentTable;
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
  type: Generated<'web-app'>;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;


export interface FolderTable {
  id: Generated<string>;

  name: string;
  type: Generated<string>;
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
  type: Generated<string>;
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
  type: Generated<string>;
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
  type: Generated<string>;
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

