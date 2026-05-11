import { useEffect, useMemo, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';

import { GenericNode, type IOItem } from './GenericNode';
import type { TNodeDetails } from '../FlowEditor';


interface IIfNodeProps {
  onGetDetails(nodeId: string): Promise<TNodeDetails>;
}
export function IfNode({ id, onGetDetails }: NodeProps<Node> & IIfNodeProps) {
  const [details, setDetails] = useState<TNodeDetails>();


  useEffect(() => {
    onGetDetails(id).then(result => setDetails(result))
  }, [onGetDetails, id])


  const { title, outputs, inputs } = useMemo(() => {
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
    />
  );
}
