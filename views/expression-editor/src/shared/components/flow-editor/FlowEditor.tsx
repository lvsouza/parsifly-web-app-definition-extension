import { useCallback, useState } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlow, SelectionMode, type Connection, type Edge, type EdgeChange, type Node, type NodeChange } from '@xyflow/react';

import { InputGetVariableNode } from './nodes/InputGetVariableNode';
import { InputCallActionNode } from './nodes/InputCallActionNode';
import { InputBooleanNode } from './nodes/InputBooleanNode';
import { InputBinaryNode } from './nodes/InputBinaryNode';
import { InputNumberNode } from './nodes/InputNumberNode';
import { InputStringNode } from './nodes/InputStringNode';
import { OutputNode } from './nodes/OutputNode';


const nodeTypes = {
  outputResult: OutputNode,
  inputString: InputStringNode,
  inputNumber: InputNumberNode,
  inputBinary: InputBinaryNode,
  inputBoolean: InputBooleanNode,
  inputCallAction: InputCallActionNode,
  inputGetVariable: InputGetVariableNode,
};

const initialNodes: Node[] = [
  // ---------------------------------------------------------
  // 1. String
  // ---------------------------------------------------------
  {
    id: 'src-string',
    type: 'inputString',
    position: { x: 50, y: 50 },
    data: { value: 'Olá mundo' },
  },
  {
    id: 'out-1',
    type: 'outputResult',
    position: { x: 450, y: 50 },
    data: { label: 'Display String' },
  },

  // ---------------------------------------------------------
  // 2. Number
  // ---------------------------------------------------------
  {
    id: 'src-number',
    type: 'inputNumber',
    position: { x: 50, y: 200 },
    data: { value: 42 },
  },
  {
    id: 'out-2',
    type: 'outputResult',
    position: { x: 450, y: 200 },
    data: { label: 'Display Number' },
  },

  // ---------------------------------------------------------
  // 3. Boolean
  // ---------------------------------------------------------
  {
    id: 'src-boolean',
    type: 'inputBoolean',
    position: { x: 50, y: 350 },
    data: { value: true },
  },
  {
    id: 'out-3',
    type: 'outputResult',
    position: { x: 450, y: 350 },
    data: { label: 'Display Boolean' },
  },

  // ---------------------------------------------------------
  // 4. Binary / File
  // ---------------------------------------------------------
  {
    id: 'src-binary',
    type: 'inputBinary',
    position: { x: 50, y: 500 },
    data: {},
  },
  {
    id: 'out-4',
    type: 'outputResult',
    position: { x: 450, y: 500 },
    data: { label: 'Display Binary' },
  },

  // ---------------------------------------------------------
  // 5. Get Variable
  // ---------------------------------------------------------
  {
    id: 'src-variable',
    type: 'inputGetVariable',
    position: { x: 50, y: 650 },
    data: { selectedVar: 'session_token' },
  },
  {
    id: 'out-5',
    type: 'outputResult',
    position: { x: 450, y: 650 },
    data: { label: 'Display String' },
  },

  // ---------------------------------------------------------
  // 6. Call Action
  // ---------------------------------------------------------
  {
    id: 'src-action',
    type: 'inputCallAction',
    position: { x: 50, y: 800 },
    data: { action: 'fetchUser' }, // O mock interno gera os outputs: 'user_data' e 'error'
  },
  {
    id: 'out-6',
    type: 'outputResult',
    position: { x: 450, y: 800 },
    data: { label: 'Display String' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-string',
    source: 'src-string',
    target: 'out-1',
    sourceHandle: 'out-string', // Tem que bater exatamente com o ID que definimos no componente
    targetHandle: 'in-1',
  },
  {
    id: 'e-number',
    source: 'src-number',
    target: 'out-2',
    sourceHandle: 'out-number',
    targetHandle: 'in-2',
  },
  {
    id: 'e-boolean',
    source: 'src-boolean',
    target: 'out-3',
    sourceHandle: 'out-boolean',
    targetHandle: 'in-3',
  },
  {
    id: 'e-binary',
    source: 'src-binary',
    target: 'out-4',
    sourceHandle: 'out-binary',
    targetHandle: 'in-4',
  },
  {
    id: 'e-variable',
    source: 'src-variable',
    target: 'out-5',
    sourceHandle: 'out-variable',
    targetHandle: 'in-5',
  },
  {
    id: 'e-action',
    source: 'src-action',
    target: 'out-6',
    sourceHandle: 'user_data', // ID dinâmico gerado pelo mock da action 'fetchUser'
    targetHandle: 'in-6',
  },
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
      //fitView
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
