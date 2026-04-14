import { type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';


type InputGetVariableData = {
  handleId: string;
  variable: string | undefined;
};
interface IInputGetVariableNodeProps {
  onSelectClick(nodeId: string): void;
}
export function InputGetVariableNode({ id, data, onSelectClick }: NodeProps<Node<InputGetVariableData>> & IInputGetVariableNodeProps) {
  return (
    <GenericNode
      title={`Get ${data.variable || 'variable'}`}
      outputs={[
        {
          id: data.handleId,
          content: (
            <button
              onClick={() => onSelectClick(id)}
              className="nodrag w-32 h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
            >
              {data.variable || 'Select'}
            </button>
          ),
        },
      ]}
    />
  );
}
