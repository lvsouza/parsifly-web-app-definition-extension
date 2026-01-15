import { CompletionsDescriptor, CompletionViewItem, TExtensionContext } from 'parsifly-extension-base';

import { createDatabaseHelper } from '../definition/DatabaseHelper';


const primitiveTypes = [
  new CompletionViewItem({
    key: 'string',
    initialValue: {
      label: 'String',
      value: 'string',
      icon: { type: 'string' },
      //description: 'Base type for strings',
    },
  }),
  new CompletionViewItem({
    key: 'number',
    initialValue: {
      label: 'Number',
      value: 'number',
      icon: { type: 'number' },
      //description: 'Base type for numbers',
    },
  }),
  new CompletionViewItem({
    key: 'boolean',
    initialValue: {
      label: 'Boolean',
      value: 'boolean',
      icon: { type: 'boolean' },
      //description: 'Base type for booleans',
    },
  }),
  new CompletionViewItem({
    key: 'binary',
    initialValue: {
      label: 'Binary',
      value: 'binary',
      icon: { type: 'binary' },
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
      icon: { type: 'object' },
      //description: 'Allow to add more attributes',
    },
  }),
  new CompletionViewItem({
    key: 'array',
    initialValue: {
      label: 'Array',
      value: 'array',
      icon: { type: 'array' },
      //description: 'List of some primitive or composed type',
    },
  }),
];

export const createGlobalDataTypeCompletionsDescriptor = (extensionContext: TExtensionContext) => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  return new CompletionsDescriptor({
    key: 'basic',
    onGetCompletions: async (intent) => {
      const structures = await databaseHelper
        .selectFrom('structure')
        .select(['id', 'name', 'description'])
        .execute()

      if (intent.kind === 'type') return [
        ...primitiveTypes,
        ...primitiveComposableTypes,
        ...structures.map(structure => (
          new CompletionViewItem({
            key: structure.id,
            initialValue: {
              label: structure.name,
              icon: { type: 'structure' },
              //description: structure.description || '',
              value: { type: 'structure', referenceId: structure.id },
            },
          })
        )),
      ];

      if (intent.kind === 'type_of_array') return [
        ...primitiveTypes,
        new CompletionViewItem({
          key: 'object',
          initialValue: {
            label: 'Object',
            value: 'object',
            icon: { type: 'object' },
            //description: 'Allow to add more attributes',
          },
        }),
        ...structures.map(structure => (
          new CompletionViewItem({
            key: structure.id,
            initialValue: {
              label: structure.name,
              icon: { type: 'structure' },
              //description: structure.description || '',
              value: { type: 'structure', referenceId: structure.id },
            },
          })
        )),
      ];

      return [];
    }
  })
}
