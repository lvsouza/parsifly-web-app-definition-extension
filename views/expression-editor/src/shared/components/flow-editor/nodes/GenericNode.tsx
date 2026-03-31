import { Handle, Position } from '@xyflow/react';
import type { ReactNode } from 'react';

// Tipagem para os itens de Input e Output
export type IOItem = {
  id: string;
  content: ReactNode;
  hideHandle?: boolean; // Permite ocultar a alça caso seja só um item visual
};

// Agora ele recebe props diretas em vez de NodeProps
export type GenericNodeProps = {
  title?: string;
  children?: ReactNode; // Útil para controles globais do nó (ex: selects sem porta)
  inputs?: IOItem[];
  outputs?: IOItem[];
};

export function GenericNode({ title, children, inputs, outputs }: GenericNodeProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 p-2 ring ring-border rounded bg-paper hover:in-[.selectable]:ring-primary in-[.selected]:ring-primary">
      {title && (
        <div className="font-bold text-start text-xs">
          {title}
        </div>
      )}

      {children && (
        <div className="flex flex-col gap-1">
          {children}
        </div>
      )}

      <div className="flex justify-between gap-4">
        {inputs && inputs.length > 0 && (
          <div className="flex flex-1 flex-col gap-3">
            {inputs.map((input) => (
              <div key={input.id} className="relative flex items-center gap-2">
                {!input.hideHandle && (
                  <Handle
                    type="target"
                    id={input.id}
                    className="w-3 h-3 bg-blue-500"
                    position={Position.Left}
                    style={{ left: '-12px' }}
                  />
                )}
                <div className='flex-1'>{input.content}</div>
              </div>
            ))}
          </div>
        )}

        {outputs && outputs.length > 0 && (
          <div className="flex flex-1 flex-col gap-3 mt-1">
            {outputs.map((output) => (
              <div key={output.id} className="relative flex items-center justify-end gap-2">
                <div className="flex-1 text-right">{output.content}</div>
                {!output.hideHandle && (
                  <Handle
                    type="source"
                    id={output.id}
                    className="w-3 h-3 bg-green-500"
                    position={Position.Right}
                    style={{ right: '-12px' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
