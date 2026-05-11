import { DragAndDropProvider } from 'react-use-drag-and-drop';
import { ReactFlowProvider } from '@xyflow/react';

import { ContextPanel } from './shared/components/context-panel/ContextPanel';
import { FlowEditor } from './shared/components/flow-editor/FlowEditor';


export const App = () => {
  return (
    <DragAndDropProvider>
      <div className='h-screen w-screen bg-transparent flex'>
        <div className='bg-paper min-w-60 max-w-60 h-screen flex'>
          <ContextPanel />
        </div>

        <ReactFlowProvider>
          <FlowEditor />
        </ReactFlowProvider>
      </div>
    </DragAndDropProvider>
  );
}
