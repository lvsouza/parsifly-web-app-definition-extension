import { useCallback, useState } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlow, SelectionMode, type Connection, type Edge, type EdgeChange, type Node, type NodeChange } from '@xyflow/react';

import { GenericNode } from './GenericNode';


const nodeTypes = {
  generic: GenericNode,
};

const initialNodes: Node[] = [
  {
    id: 'n1',
    type: 'generic',
    position: { x: 50, y: 50 },
    data: {
      inputs: [],
      title: 'Input string',
      outputs: [
        { id: 'out-text', name: 'String', icon: '/dist/string.svg', description: 'String output' },
      ]
    }
  },
  {
    id: 'n2',
    type: 'generic',
    position: { x: 450, y: 50 },
    data: {
      outputs: [],
      title: 'Output',
      inputs: [
        { id: 'in-text', name: 'Parameter', icon: '/dist/string.svg', description: 'Recebe texto puro' },
      ],
    }
  }
];

const initialEdges: Edge[] = [
  {
    source: 'n1',
    target: 'n2',
    id: 'e-n1-n2',
    sourceHandle: 'out-text',
    targetHandle: 'in-text',
  }
];

const panOnDrag = [1, 2];

interface IFlowEditorProps {
  //children: React.ReactNode;
}
export const FlowEditor = ({ }: IFlowEditorProps) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);


  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);


  return (
    <ReactFlow
      fitView
      panOnScroll
      nodes={nodes}
      edges={edges}
      selectionOnDrag
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      panOnDrag={panOnDrag}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      selectionMode={SelectionMode.Partial}
    >
      <Background patternClassName='stroke-paper' />

      <Controls
        fitViewOptions={{}}
        position='bottom-left'
        className='bg-paper'
      />
      <MiniMap
        zoomable
        pannable
        offsetScale={1}
        nodeStrokeWidth={3}
        position='bottom-left'
        nodeColor='var(--color-paper)'
        maskColor='var(--color-paper)'
        bgColor='var(--color-background)'
        style={{
          width: 100,
          height: 100,
          marginLeft: 56,
        }}
      />
    </ReactFlow>
  );
};
