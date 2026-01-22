/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';
import { observe, set } from 'react-observing';

import { UIEditor, type TDropFunctionProps, type TElement, type TValueParseFunction } from './editor';
import { INITIAL_CONTENT } from './MockContent';
import { uuid } from './editor/helpers';


export function App() {
  const studioApi = useRef(acquireStudioApi());

  const [content, setContent] = useState<typeof INITIAL_CONTENT>();


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (value, id) => {
      console.log('Extension view:', value, id);

      setContent(INITIAL_CONTENT);

      studioApi.current.send('Hello from UI Editor')
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToDragEvent(async (_type, _data, monitor) => {

      // TODO: Update to force work with react-use-drag-and-drop lib
      const target = window.document.elementFromPoint(monitor.x, monitor.y)
      if (target) {
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer(), // necessário para simular um drag real
        });

        target.dispatchEvent(dragOverEvent);
      }
    });

    return () => unsubscribe();
  }, []);


  const hoveredId = useMemo(() => observe<string | undefined>(undefined), []);
  const selectedId = useMemo(() => observe<string | undefined>(undefined), []);


  const handleGetDropElement = useCallback((element: string | TElement): TElement<"html" | "component" | "slot" | "text"> => {
    if (typeof element === 'object') return element;

    if (element === 'text') {
      return {
        id: observe(uuid()),
        type: observe('text'),
        name: observe('text'),
        customData: { teste: 15 },
        text: observe('Text here'),
      };
    } else if (element === 'button') {
      return {
        id: observe(uuid()),
        type: observe('html'),
        tag: observe('button'),
        customData: { teste: 3 },
        name: observe('button'),
        children: observe([
          {
            id: observe(uuid()),
            type: observe('text'),
            name: observe('Button text'),
            customData: { teste: 56 },
            text: observe('Button text'),
          }
        ]),
        attributes: observe([
          { name: observe('disabled'), value: observe(false) },
        ]),
        style: observe([
          { name: observe('backgroundColor'), value: observe('transparent') },
          { name: observe('color'), value: observe('black') },
          { name: observe('border'), value: observe('thin solid') },
        ]),
      };
    } else if (element === 'div') {
      return {
        id: observe(uuid()),
        tag: observe('div'),
        type: observe('html'),
        children: observe([]),
        customData: { teste: 4 },
        attributes: observe([]),
        name: observe('div'),
        style: observe([]),
      };
    } else if (element === 'p') {
      return {
        id: observe(uuid()),
        tag: observe('p'),
        name: observe('p'),
        style: observe([]),
        type: observe('html'),
        attributes: observe([]),
        customData: { teste: 4 },
        children: observe([
          {
            id: observe(uuid()),
            type: observe('text'),
            name: observe('text'),
            customData: { teste: 56 },
            text: observe('Paragraph'),
          }
        ]),
      };
    } else if (element === 'simple-component') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('CustomInput'),
        referenceComponentId: observe('simple-component'),
      };
    } else if (element === 'component-with-slot') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('component-with-slot'),
        referenceComponentId: observe('component-with-slot'),
      };
    } else if (element === 'component-with-component-with-slot') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('component-with-component-with-slot'),
        referenceComponentId: observe('component-with-component-with-slot'),
      };
    } else if (element === 'component-with-component-with-slot-with-child') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('component-with-component-with-slot-with-child'),
        referenceComponentId: observe('component-with-component-with-slot-with-child'),
      };
    } else if (element === 'component-with-it-self') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('component-with-it-self'),
        referenceComponentId: observe('component-with-it-self'),
      };
    } else if (element === 'component-with-component-inside-with-this-inside') {
      return {
        id: observe(uuid()),
        slots: observe([]),
        type: observe('component'),
        name: observe('component-with-component-inside-with-this-inside'),
        referenceComponentId: observe('component-with-component-inside-with-this-inside'),
      };
    }

    throw new Error("Error on create the new element");
  }, []);

  const handleDrop = useCallback(({ element, from, to }: TDropFunctionProps) => {
    //console.log(element, from, to);

    if (!content) return;

    if (from.element && typeof element !== 'string') {
      set(from.element === 'root' ? content.value : from.element.children, oldContent => {
        if (!oldContent) return oldContent;
        return [...oldContent.filter(contentItem => contentItem.id.value !== element.id.value)];
      });
    }

    // É preciso calcular o position antes porque pode haver conflitos com o remover
    const droppedElement = handleGetDropElement(element);

    if (to.element === 'root') {
      const position = (from.element === to.element) && (from.position < to.position) ? to.position - 1 : to.position;

      set(content.value, oldContent => {
        oldContent.splice(position, 0, droppedElement);
        return [...oldContent];
      });
    } else {
      const position = (from.element !== 'root' && from.element?.id.value === to.element.id.value) && (from.position < to.position)
        ? to.position - 1
        : to.position;

      set(to.element.children, oldContent => {
        if (!oldContent) return oldContent;

        oldContent.splice(position, 0, droppedElement);

        return [...oldContent];
      });
    }

    set(selectedId, droppedElement.id.value);
  }, [content, handleGetDropElement, selectedId]);

  const handleRemove = useCallback((element: TElement) => {
    console.log('remove', element);
  }, []);

  const handleAddSlot = useCallback((element: TElement, referenceComponent: TElement<'component'>) => {
    set(referenceComponent.slots, old => {
      if (old?.some(slot => slot.referenceSlotId.value === element.id.value)) return old;

      return [
        ...(old || []),
        {
          id: observe(uuid()),
          children: observe([]),
          referenceSlotId: observe(element.id.value),
          type: observe<'slot-content'>('slot-content'),
        },
      ];
    });
  }, []);


  const handleExpressionToValue: TValueParseFunction = useCallback((value, /* ownerName, type, element */) => {
    try {
      return eval(String(value));
    } catch (error) {
      return value;
    }
  }, []);

  const handleValueToExpression: TValueParseFunction = useCallback((value, /* ownerName, type, element */) => {
    return `"${value}"`;
  }, []);


  if (!content) return null;

  return (
    <UIEditor
      value={content.value}
      styles={content.styles}
      components={content.components}
      onKeyDown={(...rest) => console.log('end', ...rest)}

      hoveredId={hoveredId}
      selectedId={selectedId}
      onHover={id => set(hoveredId, id)}
      onSelect={id => set(selectedId, id)}

      onDrop={handleDrop}
      onAddSlotContent={handleAddSlot}
      onDragEnd={(...rest) => console.log('end', ...rest)}
      onDragStart={(...rest) => console.log('start', ...rest)}

      onRemove={handleRemove}
      onDuplicate={(...rest) => console.log('duplicate', ...rest)}

      onExpressionToValue={handleExpressionToValue}
      onValueToExpression={handleValueToExpression}
    />
  );
}
