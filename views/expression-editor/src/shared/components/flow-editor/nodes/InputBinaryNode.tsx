import { useEffect, useMemo, useState } from 'react';
import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IInputBinaryNodeProps {
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function InputBinaryNode({ id, onGetDetails }: NodeProps<Node> & IInputBinaryNodeProps) {
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
          className="nodrag w-32 h-7.5 p-1 py-0 ring ring-border cursor-default text-left truncate"
        >
          {value || 'Select'}
        </button>
      </label>
    </GenericNode>
  );
}