import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { eq, sql } from 'drizzle-orm';

import { externalComponentSlot, property } from '../../definition/schema';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createExternalComponentSlotFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-externalComponentSlot-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'externalComponentSlot') return [];

      const [result] = await databaseHelper
        .select({ id: property.id, externalComponentSlotId: sql<string | undefined>`${externalComponentSlot.id}`.as('externalComponentSlotId') })
        .from(property)
        .leftJoin(externalComponentSlot, eq(externalComponentSlot.propertyId, property.id))
        .where(eq(property.id, target.id))
        .limit(1);

      if (!result) return [];


      return [
        new FieldViewItem({
          key: `type:${result.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'External component slot',
          },
        }),
        new FieldViewItem({
          key: `name:${result.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change slot name',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ name: property.name })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ name: value })
                .where(eq(property.id, result.id));
            },
          },
        }),
        new FieldViewItem({
          key: `description:${result.id}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change slot description',
            getValue: async () => {
              const [item] = await databaseHelper
                .select({ description: property.description })
                .from(property)
                .where(eq(property.id, result.id))
                .limit(1);

              return item.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;

              await databaseHelper
                .update(property)
                .set({ description: value })
                .where(eq(property.id, result.id));
            },
          }
        }),
      ];
    }
  });
}

