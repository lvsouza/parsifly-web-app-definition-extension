import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { project } from '../definition/schema';
import { eq } from 'drizzle-orm';


export const createProjectFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-project-fields-descriptor',
    onGetFields: async (intent) => {
      const [target] = intent.targets
      if (target.kind !== 'project') return [];

      const [result] = await databaseHelper
        .select({
          id: project.id,
          name: project.name,
          public: project.public,
          version: project.version,
          description: project.description,
        })
        .from(project)
        .where(eq(project.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            type: 'view',
            name: 'type',
            label: 'Type',
            getValue: async () => 'Project',
          },
        }),
        new FieldViewItem({
          key: `projectType:${result.id}`,
          initialValue: {
            type: 'view',
            name: 'projectType',
            label: 'Project type',
            getValue: async () => 'Web app',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change project name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  name: project.name,
                })
                .from(project)
                .where(eq(project.id, result.id))
                .limit(1);

              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(project)
                .set({ name: value })
                .where(eq(project.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change project description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  description: project.description,
                })
                .from(project)
                .where(eq(project.id, result.id))
                .limit(1);

              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(project)
                .set({ description: value })
                .where(eq(project.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `version:${result.id}`,
          initialValue: {
            type: 'text',
            name: 'version',
            label: 'Version',
            description: 'Change project version',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  version: project.version,
                })
                .from(project)
                .where(eq(project.id, result.id))
                .limit(1)
              return item?.version || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper
                .update(project)
                .set({ version: value })
                .where(eq(project.id, result.id));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change project visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({
                  public: project.public,
                })
                .from(project)
                .where(eq(project.id, result.id))
                .limit(1);

              return item?.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(project)
                .set({ public: value })
                .where(eq(project.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

