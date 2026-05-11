import { useEffect, useMemo, useState } from 'react';
import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IInputBooleanNodeProps {
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function InputBooleanNode({ id, onGetDetails }: NodeProps<Node> & IInputBooleanNodeProps) {
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
      <label className="flex items-center justify-end gap-2 w-32 h-7.5 cursor-pointer">
        <span>{value ? 'True' : 'False'}</span>
        <input
          type="checkbox"
          checked={!!value || false}
          className="nodrag cursor-pointer"
          onChange={(e) => updateNodeData(id, { value: e.target.checked })}
        />
      </label>
    </GenericNode>
  );
}