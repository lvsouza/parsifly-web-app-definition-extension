import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

type InputBinaryData = { fileName?: string };

export function InputBinaryNode({ id, data }: NodeProps<Node<InputBinaryData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="Binary / File"
      outputs={[
        {
          id: 'out-binary',
          content: (
            <input
              type="file"
              placeholder={data.fileName || ''}
              className="nodrag w-32 h-7.5 p-1 py-0"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateNodeData(id, { fileName: file.name });
              }}
            />
          ),
        },
      ]}
    />
  );
}