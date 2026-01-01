import { Generated, Insertable, Selectable, Updateable } from 'kysely'


export interface Database {
  project: ProjectTable;
  folder: FolderTable;
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
  description: string | null;
  createdAt: Generated<string>;

  projectOwnerId: string;

  parentProjectId: string | null;
  parentFolderId: string | null;
}

export type Page = Selectable<PageTable>;
export type NewPage = Insertable<PageTable>;
export type PageUpdate = Updateable<PageTable>;
