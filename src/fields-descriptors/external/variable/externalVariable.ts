import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq } from 'drizzle-orm';

import { createDatabaseHelper } from '../../../definition/DatabaseHelper';
import { externalVariable, property } from '../../../definition/schema';


export const createExternalVariableFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalVariable-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalVariable') return [];

      const [result] = await databaseHelper
        .select({ id: externalVariable.id, propertyId: externalVariable.propertyId })
        .from(externalVariable)
        .where(eq(externalVariable.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External variable',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change external variable name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: property.name })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ name: value })
                .where(eq(property.id, result.propertyId));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change external variable description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: property.description })
                .from(property)
                .where(eq(property.id, result.propertyId))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ description: value })
                .where(eq(property.id, result.propertyId));
            },
          }
        }),
        new FieldViewItem({
          key: `public:${result.id}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change external variable visibility',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ public: externalVariable.public })
                .from(externalVariable)
                .where(eq(externalVariable.id, result.id))
                .limit(1);

              return item.public || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper
                .update(externalVariable)
                .set({ public: value })
                .where(eq(externalVariable.id, result.id));
            },
          },
        }),
      ];
    }
  });
}

