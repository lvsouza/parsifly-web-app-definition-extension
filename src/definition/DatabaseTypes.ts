import { Generated, Insertable, Selectable, Updateable } from 'kysely'


export interface Database {
  project: ProjectTable
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
