import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createEnumFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-fields-descriptor',
    onGetFields: async (key) => {
      const enumerator = await databaseHelper
        .selectFrom('enum')
        .select(['name', 'description', 'public'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!enumerator) return [];

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enum').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || enumerator.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enum').where('id', '=', key).set('name', value).execute();
            },
          },
        }),
        new FieldViewItem({
          key: `description:${key}`,
          initialValue: {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            description: 'Change enum description',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enum').where('id', '=', key).select('description').executeTakeFirst()
              return item?.description || enumerator.description;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enum').where('id', '=', key).set('description', value).execute();
            },
          }
        }),
        new FieldViewItem({
          key: `public:${key}`,
          initialValue: {
            name: 'public',
            type: 'boolean',
            label: 'Public',
            description: 'Change enum visibility',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enum').where('id', '=', key).select('public').executeTakeFirst()
              return item?.public || enumerator.public;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'boolean') return;
              await databaseHelper.updateTable('enum').where('id', '=', key).set('public', value).execute();
            },
          },
        }),
      ];
    }
  });
}

