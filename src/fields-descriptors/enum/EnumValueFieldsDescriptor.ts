import { FieldsDescriptor, FieldViewItem, TExtensionContext } from 'parsifly-extension-base';
import { createDatabaseHelper } from '../../definition/DatabaseHelper';


export const createEnumValueFieldsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new FieldsDescriptor({
    key: 'web-app-enum-value-fields-descriptor',
    onGetFields: async (intent) => {

      const [target] = intent.targets
      if (target.kind !== 'enumValue') return [];

      const enumeratorValue = await databaseHelper
        .selectFrom('enumValue')
        .select(['id', 'name', 'parentEnumId'])
        .where('id', '=', target.id)
        .executeTakeFirst();

      if (!enumeratorValue) return [];


      const enumAttributes = await databaseHelper
        .selectFrom('enumAttribute')
        .select(['id', 'name', 'description', 'dataType'])
        .where('parentEnumId', '=', enumeratorValue.parentEnumId)
        .execute()

      return [
        new FieldViewItem({
          key: `type:${enumeratorValue.id}`,
          initialValue: {
            name: 'type',
            type: 'view',
            label: 'Type',
            getValue: async () => 'Enum value',
          },
        }),
        new FieldViewItem({
          key: `name:${enumeratorValue.id}`,
          initialValue: {
            name: 'name',
            type: 'text',
            label: 'Name',
            description: 'Change enum value name',
            getValue: async () => {
              const item = await databaseHelper.selectFrom('enumValue').where('id', '=', enumeratorValue.id).select('name').executeTakeFirst()
              return item?.name || enumeratorValue.name;
            },
            onDidChange: async (value) => {
              if (typeof value !== 'string') return;
              await databaseHelper.updateTable('enumValue').where('id', '=', enumeratorValue.id).set('name', value).execute();
            },
          },
        }),

        new FieldViewItem({
          key: `separator:${enumeratorValue.id}`,
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
                  .where('parentEnumValueId', '=', enumeratorValue.id)
                  .where('parentEnumAttributeId', '=', attribute.id)
                  .select('value')
                  .executeTakeFirst()
                return item?.value || null;
              },
              onDidChange: async (value) => {
                if (typeof value !== 'string') return;
                await databaseHelper
                  .updateTable('enumValueByAttribute')
                  .where('parentEnumValueId', '=', enumeratorValue.id)
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

