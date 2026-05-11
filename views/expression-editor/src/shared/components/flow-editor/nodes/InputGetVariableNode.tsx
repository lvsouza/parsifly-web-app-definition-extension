import { useEffect, useMemo, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IInputGetVariableNodeProps {
  onSelectClick(nodeId: string): void;
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function InputGetVariableNode({ id, onSelectClick, onGetDetails }: NodeProps<Node> & IInputGetVariableNodeProps) {
  const [details, setDetails] = useState<TNodeDetails>();


  useEffect(() => {
    onGetDetails(id).then(result => setDetails(result))
  }, [onGetDetails, id])


  const { title, value, outputs } = useMemo(() => {
    return details || { title: '', value: null, outputs: [], inputs: [] }
  }, [details])


  const outputsToRender: IOItem[] = outputs.map((output) => ({
    id: output.id,
    content: (
      <button
        onClick={() => onSelectClick(id)}
        className="nodrag w-32 h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
      >
        {output.name || 'Select'}
      </button>
    ),
  }));


  return (
    <GenericNode
      title={title}
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
