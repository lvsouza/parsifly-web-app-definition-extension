import { useEffect, useRef } from 'react';
import { useDrag } from 'react-use-drag-and-drop'

import { getCustomDragLayer } from '../../helpers/GetCustomDragLayer';
import type { IContextOption } from './ContextPanel';


interface IContextOptionProps {
  option: IContextOption
}
export const ContextOption = ({ option }: IContextOptionProps) => {
  const optionRef = useRef<HTMLButtonElement>(null)


  const { isDragging, preview } = useDrag({
    data: option,
    id: option.id,
    element: optionRef,
  }, []);
  useEffect(() => {
    preview(
      () => getCustomDragLayer(option.name, { icon: <img className='h-4 w-4' src={option.icon} /> }),
    )
  }, [preview, option.name, option.icon]);


  return (
    <>
      <button
        key={option.id}
        ref={optionRef}
        title={option.description}
        data-is-dragging={isDragging}
        className='p-0.5 px-2 flex items-center gap-2 rounded-none data-[is-dragging=true]:opacity-50'
      >
        {option.icon && (
          <img className='h-4 w-4' src={option.icon} />
        )}

        <span className='block'>
          {option.name}
        </span>
      </button>
    </>
  );
};
