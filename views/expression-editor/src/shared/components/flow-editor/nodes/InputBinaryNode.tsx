import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

type InputBinaryData = {
  handleId: string;
  fileName?: string;
};

export function InputBinaryNode({ id, data }: NodeProps<Node<InputBinaryData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="Binary"
      outputs={[
        {
          id: data.handleId,
          content: (
            <label>
              <input
                hidden
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateNodeData(id, { fileName: file.name });
                }}
              />
              <button
                onClick={e => e.currentTarget.parentElement?.click()}
                className="w-32 h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
              >
                {data.fileName || 'Select'}
              </button>
            </label>
          ),
        },
      ]}
    />
  );
}