import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';
import { enumTable, structure } from '../definition/schema';


const primitiveTypes = [
  new CompletionViewItem({
    key: 'string',
    initialValue: {
      label: 'String',
      value: 'string',
      icon: { path: 'string.svg' },
      //description: 'Base type for strings',
    },
  }),
  new CompletionViewItem({
    key: 'number',
    initialValue: {
      label: 'Number',
      value: 'number',
      icon: { path: 'number.svg' },
      //description: 'Base type for numbers',
    },
  }),
  new CompletionViewItem({
    key: 'boolean',
    initialValue: {
      label: 'Boolean',
      value: 'boolean',
      icon: { path: 'boolean.svg' },
      //description: 'Base type for booleans',
    },
  }),
];
const primitiveBinaryTypes = [
  new CompletionViewItem({
    key: 'binary',
    initialValue: {
      label: 'Binary',
      value: 'binary',
      icon: { path: 'binary.svg' },
      //description: 'Base type for binary',
    },
  }),
];
const primitiveComposableTypes = [
  new CompletionViewItem({
    key: 'object',
    initialValue: {
      label: 'Object',
      value: 'object',
      icon: { path: 'object.svg' },
      //description: 'Allow to add more properties',
    },
  }),
  new CompletionViewItem({
    key: 'array',
    initialValue: {
      label: 'Array',
      value: 'array',
      icon: { path: 'array.svg' },
      //description: 'List of some primitive or composed type',
    },
  }),
];

export const createGlobalDataTypeCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'basic',
    onGetCompletions: async (intent) => {
      if (intent.visibility?.type === 'enum_property') {
        return primitiveTypes;
      } else if (intent.visibility?.type === 'structure_property') {
        const structuresOrEnums = await databaseHelper
          .select({
            id: structure.id,
            name: structure.name,
            type: structure.type,
            description: structure.description
          })
          .from(structure)
          .unionAll(
            databaseHelper
              .select({
                id: enumTable.id,
                name: enumTable.name,
                type: enumTable.type,
                description: enumTable.description
              })
              .from(enumTable)
          )

        if (intent.kind === 'type') return [
          ...primitiveTypes,
          ...primitiveBinaryTypes,
          ...primitiveComposableTypes,
          ...structuresOrEnums.map(structure => (
            new CompletionViewItem({
              key: structure.id,
              initialValue: {
                label: structure.name,
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
                //description: structure.description || '',
                value: { type: structure.type === 'structure' ? 'structure' : 'enum', referenceId: structure.id },
              },
            })
          )),
        ];

        if (intent.kind === 'type_of_array') return [
          ...primitiveTypes,
          ...primitiveBinaryTypes,
          new CompletionViewItem({
            key: 'object',
            initialValue: {
              label: 'Object',
              value: 'object',
              icon: { path: 'object.svg' },
              //description: 'Allow to add more properties',
            },
          }),
          ...structuresOrEnums.map(structure => (
            new CompletionViewItem({
              key: structure.id,
              initialValue: {
                label: structure.name,
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
                //description: structure.description || '',
                value: { type: structure.type === 'structure' ? 'structure' : 'enum', referenceId: structure.id },
              },
            })
          )),
        ];
      }

      return [];
    }
  })
}
