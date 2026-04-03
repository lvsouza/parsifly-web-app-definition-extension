import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';


type InputBooleanData = {
  value?: boolean;
  handleId: string;
};
export function InputBooleanNode({ id, data }: NodeProps<Node<InputBooleanData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="Boolean"
      outputs={[
        {
          id: data.handleId,
          content: (
            <label className="flex items-center justify-end gap-2 w-32 h-7.5 cursor-pointer">
              <span>{data.value ? 'True' : 'False'}</span>
              <input
                type="checkbox"
                checked={data.value || false}
                className="nodrag cursor-pointer"
                onChange={(e) => updateNodeData(id, { value: e.target.checked })}
              />
            </label>
          ),
        },
      ]}
    />
  );
}