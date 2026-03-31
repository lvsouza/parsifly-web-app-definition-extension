import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode } from './GenericNode';

type InputGetVariableData = { selectedVar?: string };

const MOCK_VARIABLES = ['user_id', 'session_token', 'company_name'];

export function InputGetVariableNode({ id, data }: NodeProps<Node<InputGetVariableData>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <GenericNode
      title="Get Variable"
      outputs={[
        {
          id: 'out-variable',
          content: (
            <select
              value={data.selectedVar || ''}
              className="nodrag w-32 h-7.5 p-1 py-0"
              onChange={(e) => updateNodeData(id, { selectedVar: e.target.value })}
            >
              <option value="" disabled>Selecione...</option>
              {MOCK_VARIABLES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          ),
        },
      ]}
    />
  );
}