import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { GenericNode, type IOItem } from './GenericNode';

type InputCallActionData = { action?: string };

// Mock das ações e quais outputs cada uma gera
const ACTIONS_MOCK: Record<string, string[]> = {
  fetchUser: ['user_data', 'error'],
  processPayment: ['receipt', 'status', 'error'],
  sendEmail: ['success', 'error'],
};

export function InputCallActionNode({ id, data }: NodeProps<Node<InputCallActionData>>) {
  const { updateNodeData } = useReactFlow();

  const selectedAction = data.action || 'fetchUser';
  const dynamicOutputs = ACTIONS_MOCK[selectedAction] || [];

  // Converte a lista de strings em portas de output visuais
  const outputsToRender: IOItem[] = dynamicOutputs.map((outId) => ({
    id: outId,
    content: <span>{outId}</span>,
  }));

  return (
    <GenericNode
      title="Call Action"
      outputs={outputsToRender}
    >
      <select
        value={selectedAction}
        className="nodrag w-32 h-7.5 p-1 py-0"
        onChange={(e) => updateNodeData(id, { action: e.target.value })}
      >
        {Object.keys(ACTIONS_MOCK).map((action) => (
          <option key={action} value={action}>
            {action}
          </option>
        ))}
      </select>
    </GenericNode>
  );
}