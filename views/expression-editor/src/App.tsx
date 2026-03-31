import { ContextPanel, type IContextOptionGroup } from './shared/components/context-panel/ContextPanel';
import { FlowEditor } from './shared/components/flow-editor/FlowEditor';


const defaultOptionGroups: IContextOptionGroup[] = [
  {
    id: 'basic-group',
    name: 'Basic',
    description: 'Basic nodes for expression builder',
    options: [
      { id: '1', name: 'Input String', icon: '/dist/string.svg', description: 'Basic string input' },
      { id: '2', name: 'Input Number', icon: '/dist/number.svg', description: 'Basic number input' },
      { id: '3', name: 'Input Boolean', icon: '/dist/boolean.svg', description: 'Basic boolean input' },
      { id: '4', name: 'Input Binary', icon: '/dist/binary.svg', description: 'Basic binary input' },
      { id: '5', name: 'Input Object', icon: '/dist/object.svg', description: 'Basic object input' },
      { id: '6', name: 'Input Array', icon: '/dist/array.svg', description: 'Basic array input' },
    ]
  },
  {
    id: 'variable-group',
    name: 'Variables',
    description: 'Get variable node for expression builder',
    options: [
      { id: '1', name: 'Get variable', icon: '/dist/project-variable.svg', description: 'Get a variable' },
      { id: '2', name: 'Get external variable', icon: '/dist/external-variable.svg', description: 'Get a external variable' },
    ]
  },
  {
    id: 'action-group',
    name: 'Actions',
    description: 'Call actions node for expression builder',
    options: [
      { id: '1', name: 'Call action', icon: '/dist/project-action.svg', description: 'Call a action' },
      { id: '2', name: 'Call external action', icon: '/dist/external-action.svg', description: 'Call a external action' },
    ]
  },
];

export const App = () => {

  return (
    <div className='h-screen w-screen bg-transparent flex'>
      <div className='bg-paper min-w-60 max-w-60 h-screen flex'>
        <ContextPanel optionGroups={defaultOptionGroups} />
      </div>

      <FlowEditor />
    </div>
  );
}
