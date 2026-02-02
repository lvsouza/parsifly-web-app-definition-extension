import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createEnumValueFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-value-fields-descriptor',
    onGetFields: async (key) => {
      const enumerator = await databaseHelper
        .selectFrom('enumValue')
        .select(['name', 'parentEnumId'])
        .where('id', '=', key)
        .executeTakeFirst();


      if (!enumerator) return [];

      const enumAttributes = await databaseHelper
        .selectFrom('enumAttribute')
        .select(['id', 'name', 'description', 'dataType'])
        .where('parentEnumId', '=', enumerator.parentEnumId)
        .execute()

      return [
        new FieldViewItem({
          key: `type:${key}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum value',
          },
        }),
        new FieldViewItem({
          key: `name:${key}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum value name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumValue').where('id', '=', key).select('name').executeTakeFirst()
              return item?.name || enumerator.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enumValue').where('id', '=', key).set('name', value).execute();
            },
          },
        }),

        new FieldViewItem({
          key: `separator:${key}`,
          initialValue: {
            type: 'view',
            name: 'separator',
            getValue: async () => '',
            label: 'Attribute values',
          },
        }),

        ...enumAttributes.map(attribute => (
          new FieldViewItem({
            key: `attribute${attribute.name}:${attribute.id}`,
            initialValue: {
              name: 'name',
              label: attribute.name,
              description: 'Change enum value name',
              type: attribute.dataType === 'null'
                ? 'view'
                : attribute.dataType === 'string'
                  ? 'text'
                  : attribute.dataType === 'number'
                    ? 'number'
                    : 'boolean',
              getValue: async () => {
                const item = await databaseHelper
                  .selectFrom('enumValueByAttribute')
                  .where('parentEnumValueId', '=', key)
                  .where('parentEnumAttributeId', '=', attribute.id)
                  .select('value')
                  .executeTakeFirst()
                return item?.value || null;
              },
              onDidChange: async (value) => {
                if (typeof value !== 'string') return;
                await databaseHelper
                  .updateTable('enumValueByAttribute')
                  .where('parentEnumValueId', '=', key)
                  .where('parentEnumAttributeId', '=', attribute.id)
                  .set('value', value ? JSON.stringify(value) : null).execute();
              },
            },
          })
        ))
      ];
    }
  });
}

