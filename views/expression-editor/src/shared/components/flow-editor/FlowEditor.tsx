import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlow, SelectionMode, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeTypes } from '@xyflow/react';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';

import { InputGetVariableNode } from './nodes/InputGetVariableNode';
import { InputCallActionNode } from './nodes/InputCallActionNode';
import { InputBooleanNode } from './nodes/InputBooleanNode';
import { InputBinaryNode } from './nodes/InputBinaryNode';
import { InputNumberNode } from './nodes/InputNumberNode';
import { InputStringNode } from './nodes/InputStringNode';
import { OutputNode } from './nodes/OutputNode';


const initialNodes: Node[] = [
  {
    id: 'src-string',
    type: 'inputString',
    position: { x: 50, y: 50 },
    data: {
      value: 'Olá mundo',
      handleId: 'string-out',
    },
  },
  {
    id: 'out-1',
    type: 'outputResult',
    position: { x: 450, y: 50 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
  {
    id: 'src-number',
    type: 'inputNumber',
    position: { x: 50, y: 200 },
    data: {
      value: 42,
      handleId: 'number-out',
    },
  },
  {
    id: 'out-2',
    type: 'outputResult',
    position: { x: 450, y: 200 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
  {
    id: 'src-boolean',
    type: 'inputBoolean',
    position: { x: 50, y: 350 },
    data: {
      value: true,
      handleId: 'boolean-out',
    },
  },
  {
    id: 'out-3',
    type: 'outputResult',
    position: { x: 450, y: 350 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
  {
    id: 'src-binary',
    type: 'inputBinary',
    position: { x: 50, y: 500 },
    data: {
      handleId: 'binary-out',
    },
  },
  {
    id: 'out-4',
    type: 'outputResult',
    position: { x: 450, y: 500 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
  {
    id: 'src-variable',
    type: 'inputGetVariable',
    position: { x: 50, y: 650 },
    data: {
      handleId: 'variable-out',
      variable: 'SessionToken',
    },
  },
  {
    id: 'out-5',
    type: 'outputResult',
    position: { x: 450, y: 650 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
  {
    id: 'src-action',
    type: 'inputCallAction',
    position: { x: 50, y: 800 },
    data: {
      action: 'FetchUser',
      parameters: [
        {
          id: 'user-id',
          name: 'UserId',
        }
      ],
      outputs: [
        {
          id: 'user-data-out',
          name: 'UserData'
        },
        {
          id: 'error-out',
          name: 'Error'
        },
      ],
    },
  },
  {
    id: 'out-6',
    type: 'outputResult',
    position: { x: 450, y: 800 },
    data: {
      label: 'Output',
      name: 'Parameter',
      handleId: 'result-in',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-string',
    source: 'src-string',
    target: 'out-1',
    sourceHandle: 'string-out',
    targetHandle: 'result-in',
  },
  {
    id: 'e-number',
    source: 'src-number',
    target: 'out-2',
    sourceHandle: 'number-out',
    targetHandle: 'result-in',
  },
  {
    id: 'e-boolean',
    source: 'src-boolean',
    target: 'out-3',
    sourceHandle: 'boolean-out',
    targetHandle: 'result-in',
  },
  {
    id: 'e-binary',
    source: 'src-binary',
    target: 'out-4',
    sourceHandle: 'binary-out',
    targetHandle: 'result-in',
  },
  {
    id: 'e-variable',
    source: 'src-variable',
    target: 'out-5',
    sourceHandle: 'variable-out',
    targetHandle: 'result-in',
  },
  {
    id: 'e-action',
    source: 'src-action',
    target: 'out-6',
    sourceHandle: 'user-data-out',
    targetHandle: 'result-in',
  },
];

const panOnDrag = [1, 2];

export const FlowEditor = () => {
  const studioApi = useRef(acquireStudioApi());


  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (event, value) => {
      if (event === 'update:content') {
        console.log(event, value)

        // setNodes(value)
        // setEdges(value)
      }
    });

    studioApi.current.send('request:update:content')

    return () => unsubscribe();
  }, []);


  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);


  const handleSelectOption = useCallback((nodeId: string) => {
    console.log('handle clicker', nodeId)
  }, []);


  const nodeTypes = useMemo((): NodeTypes => {
    return {
      outputResult: OutputNode,
      inputString: InputStringNode,
      inputNumber: InputNumberNode,
      inputBinary: InputBinaryNode,
      inputBoolean: InputBooleanNode,
      inputCallAction: (props) => <InputCallActionNode {...props} onSelectClick={handleSelectOption} />,
      inputGetVariable: (props) => <InputGetVariableNode {...props} onSelectClick={handleSelectOption} />,
    };
  }, [handleSelectOption]);


  return (
    <ReactFlow
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
        position='bottom-right'
        className='bg-paper'
      />
      <MiniMap
        zoomable
        pannable
        offsetScale={1}
        nodeStrokeWidth={3}
        position='bottom-right'
        nodeColor='var(--color-paper)'
        maskColor='var(--color-paper)'
        bgColor='var(--color-background)'
        style={{
          width: 100,
          height: 100,
          marginRight: 56,
        }}
      />
    </ReactFlow>
  );
};
