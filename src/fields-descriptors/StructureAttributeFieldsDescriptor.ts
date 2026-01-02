import { FieldsDescriptor, FieldViewItem, TApplication, TFieldViewItemType } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { TWebAppDataType, VWebAppDataType } from '../definition/DatabaseTypes';


const getFieldTypeByDataType = (dataType: TWebAppDataType): TFieldViewItemType | null => {
  switch (dataType) {
    case 'string': return 'text'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null;
  }
}

export const createStructureAttributeFieldsDescriptor = (application: TApplication) => {
  const databaseHelper = createDatabaseHelper(application);

  return new FieldsDescriptor({
    key: 'web-app-structure-attribute-fields-descriptor',
    onGetFields: async (key) => {
      const structure = await databaseHelper
        .selectFrom('structureAttribute')
        .select(['name', 'description', 'dataType', 'required', 'defaultValue'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!structure) return [];

      return [
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'structureAttribute',
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change structure attribute name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change structure attribute description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || '';
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'required',
            type: 'boolean',
            label: 'Public',
            description: 'Change structure attribute required',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('required').executeTakeFirst()
              return item?.required || false;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('required', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'dataType',
            type: 'text',
            label: 'Data type',
            description: 'Change structure attribute data type',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('dataType').executeTakeFirst()
              return item?.dataType || 'string';
            },
            onDidChange: async (value: TWebAppDataType) => {
              if (typeof value !== 'string') return;
              if (!VWebAppDataType.includes(value)) return;
              await databaseHelper
                .updateTable('structureAttribute')
                .where('id', '=', key)
                .set('dataType', value)
                .set('defaultValue', null)
                .execute();
            },
          },
        }),
        new FieldViewItem({
          key: crypto.randomUUID(),
          initialValue: {
            name: 'defaultValue',
            type: 'text',
            label: 'Default value',
            description: 'Change structure attribute default value',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('structureAttribute').where('id', '=', key).select('defaultValue').executeTakeFirst()
              return item?.defaultValue || false;
            },
            onDidChange: async (value: string | number | boolean | null) => {
              if (!value || !['string', 'number', 'boolean'].includes(typeof value)) return;
              await databaseHelper.updateTable('structureAttribute').where('id', '=', key).set('defaultValue', value ? JSON.stringify(value) : null).execute();
            },
          },
          onDidMount: async (context) => {
            let item = await databaseHelper
              .selectFrom('structureAttribute')
              .where('id', '=', key)
              .select(['dataType'])
              .executeTakeFirstOrThrow();
            const fieldType = getFieldTypeByDataType(item.dataType);
            if (fieldType) {
              await context.set('type', fieldType);
              await context.set('disabled', false);
            } else {
              await context.set('disabled', true);
              await context.set('type', 'text');
            }

            const detailsSub = await application.data.subscribe({
              query: (
                databaseHelper
                  .selectFrom('structureAttribute')
                  .select(['dataType'])
                  .where('id', '=', key)
                  .compile()
              ),
              listener: async ({ rows: [updatedItem] }) => {
                const fieldType = getFieldTypeByDataType(updatedItem.dataType);
                if (fieldType) {
                  await context.set('type', fieldType);
                  await context.set('disabled', false);
                } else {
                  await context.set('disabled', true);
                  await context.set('type', 'text');
                }

                if (item.dataType !== updatedItem.dataType) {
                  await context.reloadValue();
                }
              },
            });

            context.onDidUnmount(async () => {
              await detailsSub();
            });
          },
        }),
      ];
    }
  });
}

