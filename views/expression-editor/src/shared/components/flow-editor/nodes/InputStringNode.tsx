import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

type InputStringData = { value?: string };

export function InputStringNode({ id, data }: NodeProps<Node<InputStringData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="String"
      outputs={[
        {
          id: 'out-string',
          content: (
            <input
              type="text"
              value={data.value || ''}
              placeholder="Digite o texto..."
              className="nodrag w-32 h-7.5 p-1 py-0"
              onChange={(e) => updateNodeData(id, { value: e.target.value })}
            />
          ),
        },
      ]}
    />
  );
}