import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlow, SelectionMode, useReactFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeTypes } from '@xyflow/react';
import { useDrop, type TDragAndDropMonitor } from 'react-use-drag-and-drop';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';

import type { IContextOption } from '../context-panel/ContextPanel';
import { InputGetVariableNode } from './nodes/InputGetVariableNode';
import { InputCallActionNode } from './nodes/InputCallActionNode';
import { InputBooleanNode } from './nodes/InputBooleanNode';
import { InputBinaryNode } from './nodes/InputBinaryNode';
import { InputNumberNode } from './nodes/InputNumberNode';
import { InputStringNode } from './nodes/InputStringNode';
import { OutputNode } from './nodes/OutputNode';


const panOnDrag = [1, 2];

export const FlowEditor = () => {
  const { screenToFlowPosition } = useReactFlow();


  const reactFlowRef = useRef<HTMLDivElement>(null)
  const studioApi = useRef(acquireStudioApi());


  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (event, value) => {
      if (event === 'update:content') {
        setNodes(value.nodes)
        setEdges(value.edges)
      }
    });

    studioApi.current.send('request:update:content')

    return () => unsubscribe();
  }, []);


  const onNodesChange = useCallback((changes: NodeChange[]) => {
    studioApi.current.send('make:change:nodes', changes);
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    studioApi.current.send('make:change:edges', changes);
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((changes: Connection) => {
    studioApi.current.send('make:change:connections', changes);
    setEdges((eds) => addEdge(changes, eds));
  }, []);


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


  const handleDropInFlow = useCallback((data?: IContextOption, monitor?: TDragAndDropMonitor) => {
    if (!data || !monitor) return;

    const position = screenToFlowPosition({
      x: monitor.x,
      y: monitor.y,
    });
    const newNode = {
      position,
      type: data.type,
      id: crypto.randomUUID(),
      data: { value: data.value, handleId: data.handleId },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition]);
  useDrop({
    id: 'expression-flow',
    element: reactFlowRef,
    drop: handleDropInFlow,
  }, [handleDropInFlow]);


  return (
    <ReactFlow
      panOnScroll
      nodes={nodes}
      edges={edges}
      selectionOnDrag
      ref={reactFlowRef}
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
