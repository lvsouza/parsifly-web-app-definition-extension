import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

type InputNumberData = { value?: number };

export function InputNumberNode({ id, data }: NodeProps<Node<InputNumberData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="Number"
      outputs={[
        {
          id: 'out-number',
          content: (
            <input
              type="number"
              placeholder="0"
              value={data.value ?? ''}
              className="nodrag w-32 h-7.5 p-1 py-0"
              onChange={(e) => updateNodeData(id, { value: Number(e.target.value) })}
            />
          ),
        },
      ]}
    />
  );
}