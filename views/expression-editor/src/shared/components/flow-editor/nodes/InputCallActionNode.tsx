import { type NodeProps, type Node } from '@xyflow/react';
import { GenericNode, type IOItem } from './GenericNode';


type InputCallActionData = {
  action: string,
  outputs: {
    id: string;
    name: string;
  }[]
  parameters: {
    id: string;
    name: string;
  }[]
};

export function InputCallActionNode({ data }: NodeProps<Node<InputCallActionData>>) {

  const inputsToRender: IOItem[] = data.parameters.map((parameter) => ({
    id: parameter.id,
    content: <span>{parameter.name}</span>,
  }));

  const outputsToRender: IOItem[] = data.outputs.map((output) => ({
    id: output.id,
    content: <span>{output.name}</span>,
  }));


  return (
    <GenericNode
      inputs={inputsToRender}
      outputs={outputsToRender}
      title={`Call ${data.action || 'action'}`}
    >
      <button
        className="h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
      // onChange={(e) => updateNodeData(id, { variable: e.target.value })}
      >
        {data.action || 'Select'}
      </button>
    </GenericNode>
  );
}