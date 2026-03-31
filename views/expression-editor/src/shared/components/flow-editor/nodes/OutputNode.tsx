import { type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

// O data pode ser vazio ou conter o valor recebido para exibição
type OutputNodeData = { label?: string };

export function OutputNode({ data }: NodeProps<Node<OutputNodeData>>) {
  return (
    <GenericNode
      title={data.label || 'Output'}
      inputs={[
        {
          id: 'in-result',
          content: (
            <span className="text-xs text-gray-500 italic">
              Result
            </span>
          ),
        },
      ]}
    />
  );
}