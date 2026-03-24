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
      if (intent.visibility?.type === 'enumProperty') {
        return primitiveTypes;
      } else if (intent.visibility?.type === 'structureProperty') {
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
      } else if (intent.visibility?.type === 'externalActionOutput') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'externalActionParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'externalComponentEventParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'externalComponentParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'externalEventParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'externalVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'projectEventParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'projectVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'projectActionParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'projectActionVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'projectActionOutput') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentActionParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentActionVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentActionOutput') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'componentEventParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'pageParameter') {
        return [
          ...primitiveTypes,
        ];
      } else if (intent.visibility?.type === 'pageVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'pageActionParameter') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'pageActionVariable') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
      } else if (intent.visibility?.type === 'pageActionOutput') {
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
                //description: structure.description || '',
                icon: { path: structure.type === 'structure' ? 'structure.svg' : 'enum.svg' },
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
