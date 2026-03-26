import { FieldViewItem, TExtensionContext } from 'parsifly-extension-base';

import { ActionParameter, Property } from '../../definition/schema';


interface IGetProjectListenerSelectedActionParamsProps {
  extensionContext: TExtensionContext;
  current: Pick<ActionParameter, 'id' | 'type'> & Pick<Property, 'name' | 'description'>
}
export const loadActionParameter = async ({ current, extensionContext }: IGetProjectListenerSelectedActionParamsProps) => {
  return new FieldViewItem({
    key: `name:${current.id}`,
    initialValue: {
      name: 'name',
      error: undefined,
      type: 'expression',
      label: current.name,
      description: current.description || undefined,
      getValue: async () => {
        return '(click to edit)';
      },
      onDidClick: async () => {
        extensionContext.views.open({
          key: 'expression-editor',
          windowMode: true,
          customData: {
            resourceId: current.id,
            resourceType: current.type,
            resourceProperty: 'name',
          },
        })
      },
    },
  })
}

