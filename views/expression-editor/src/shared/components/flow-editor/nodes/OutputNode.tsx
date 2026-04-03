import { type NodeProps, type Node } from '@xyflow/react';

import { GenericNode } from './GenericNode';


type OutputNodeData = {
  name: string;
  label: string;
  handleId: string;
};
export function OutputNode({ data }: NodeProps<Node<OutputNodeData>>) {
  return (
    <GenericNode
      title={data.label}
      inputs={[
        {
          id: data.handleId,
          content: (
            <span className="text-xs italic">
              {data.name}
            </span>
          ),
        },
      ]}
    />
  );
}