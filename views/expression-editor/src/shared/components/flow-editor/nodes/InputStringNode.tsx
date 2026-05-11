import { useEffect, useMemo, useState } from 'react';
import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IInputStringNodeProps {
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function InputStringNode({ id, onGetDetails }: NodeProps<Node> & IInputStringNodeProps) {
  const { updateNodeData } = useReactFlow();


  const [details, setDetails] = useState<TNodeDetails>();


  useEffect(() => {
    onGetDetails(id).then(result => setDetails(result))
  }, [onGetDetails, id])


  const { title, value, outputs } = useMemo(() => {
    return details || { title: '', value: null, outputs: [] }
  }, [details])


  const outputsToRender: IOItem[] = outputs.map((output) => ({
    id: output.id,
    content: <span>{output.name}</span>,
  }));


  return (
    <GenericNode
      title={title}
      outputs={outputsToRender}
    >
      <input
        type="text"
        value={value?.toString() || ''}
        placeholder="Digite o texto..."
        className="nodrag w-32 h-7.5 p-1 py-0"
        onChange={(e) => updateNodeData(id, { value: e.target.value })}
      />
    </GenericNode>
  );
}