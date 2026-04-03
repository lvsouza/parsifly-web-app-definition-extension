import { type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';


type InputGetVariableData = {
  handleId: string;
  variable: string | undefined;
  onSelectClick(): void;
};
export function InputGetVariableNode({ data }: NodeProps<Node<InputGetVariableData>>) {
  return (
    <GenericNode
      title={`Get ${data.variable || 'variable'}`}
      outputs={[
        {
          id: data.handleId,
          content: (
            <button
              onClick={() => data.onSelectClick()}
              className="w-32 h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
            >
              {data.variable || 'Select'}
            </button>
          ),
        },
      ]}
    />
  );
}