import { useEffect, useMemo, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IInputCallActionNodeProps {
  onSelectClick(nodeId: string): void;
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function InputCallActionNode({ id, onSelectClick, onGetDetails }: NodeProps<Node> & IInputCallActionNodeProps) {
  const [details, setDetails] = useState<TNodeDetails>();


  useEffect(() => {
    onGetDetails(id).then(result => setDetails(result))
  }, [onGetDetails, id])


  const { title, value, outputs, inputs } = useMemo(() => {
    return details || { title: '', value: null, outputs: [], inputs: [] }
  }, [details])


  const inputsToRender: IOItem[] = inputs.map((input) => ({
    id: input.id,
    content: <span>{input.name}</span>,
  }));

  const outputsToRender: IOItem[] = outputs.map((output) => ({
    id: output.id,
    content: <span>{output.name}</span>,
  }));


  return (
    <GenericNode
      title={title}
      inputs={inputsToRender}
      outputs={outputsToRender}
    >
      <button
        onClick={() => onSelectClick(id)}
        className="h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
      >
        {value || 'Select'}
      </button>
    </GenericNode>
  );
}
