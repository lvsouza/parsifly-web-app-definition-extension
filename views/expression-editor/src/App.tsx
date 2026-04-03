import { ContextPanel } from './shared/components/context-panel/ContextPanel';
import { FlowEditor } from './shared/components/flow-editor/FlowEditor';



export const App = () => {
  return (
    <div className='h-screen w-screen bg-transparent flex'>
      <div className='bg-paper min-w-60 max-w-60 h-screen flex'>
        <ContextPanel />
      </div>

      <FlowEditor />
    </div>
  );
}
