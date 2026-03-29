import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';


// Tipagem para os itens de Input e Output
export type IOItem = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
};

// Tipagem dos dados que o nosso GenericNode vai receber
export type GenericNodeData = Node<{
  title?: string;
  inputs?: IOItem[];
  outputs?: IOItem[];
}>;
export function GenericNode({ data }: NodeProps<GenericNodeData>) {
  return (
    <div className="flex flex-col gap-1 p-1 px-1.5 ring ring-gray-700 rounded bg-paper shadow-md">
      {data.title && (
        <div className="font-bold text-start text-xs">
          {data.title}
        </div>
      )}

      <div className="flex justify-between gap-4">
        {data.inputs && data.inputs.length > 0 && (
          <div className="flex flex-1 flex-col gap-3">
            {data.inputs.map((input) => (
              <div
                key={input.id}
                title={input.description}
                className="relative flex items-center gap-2"
              >
                <Handle
                  type="target"
                  id={input.id}
                  className="w-3 h-3"
                  position={Position.Left}
                  style={{ left: '-10px' }}
                />

                {input.icon && <img src={input.icon} alt={input.name} className="w-4 h-4 object-contain" />}

                <span className="text-sm">{input.name}</span>
              </div>
            ))}
          </div>
        )}

        {data.outputs && data.outputs.length > 0 && (
          <div className="flex flex-1 flex-col gap-3">
            {data.outputs.map((output) => (
              <div
                key={output.id}
                title={output.description}
                className="relative flex items-center justify-end gap-2"
              >
                <span className="text-sm">{output.name}</span>

                {output.icon && <img src={output.icon} alt={output.name} className="w-4 h-4 object-contain" />}

                <Handle
                  type="source"
                  id={output.id}
                  className="w-3 h-3"
                  position={Position.Right}
                  style={{ right: '-10px' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
