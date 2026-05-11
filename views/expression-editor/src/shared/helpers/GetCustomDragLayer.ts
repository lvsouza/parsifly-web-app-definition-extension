import { createElement, Fragment } from 'react';
import { createRoot } from 'react-dom/client';


interface IOptions {
  textColor?: string;
  color?: string;
  /**
   * Icon image URL or a ReactNode element
   */
  icon?: React.ReactNode;
}
export const getCustomDragLayer = (text: string, options?: IOptions): HTMLLabelElement => {
  const container = document.createElement('label');

  Object.assign(container.style, {
    padding: '2px 8px 2px 4px',
    backgroundColor: options?.color || 'black',
    color: options?.textColor || '#ffffff',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '11px',
    height: '20px',
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    zIndex: '-100',
    width: 'auto',
  });


  const root = createRoot(container);
  root.render([
    createElement(Fragment, { key: '1', children: options?.icon ? options.icon : null }),
    createElement(Fragment, { key: '2', children: text }),
  ]);
  setTimeout(() => root.unmount(), 0);

  document.body.appendChild(container);


  return container;
};
