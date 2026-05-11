import { useEffect, useMemo, useRef, useState } from 'react';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';

import { ContextOption } from './ContextOption';


export interface IContextOption {
  id: string;
  name: string;
  icon?: string;
  description?: string;

  type: string;
  handleId: string;
  value: string | number | boolean | null;
}

export interface IContextOptionGroup {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  options: IContextOption[];
}

export const ContextPanel = () => {
  const studioApi = useRef(acquireStudioApi());


  const [optionGroups, setOptionGroups] = useState<IContextOptionGroup[]>([])
  const [search, setSearch] = useState('');


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (event, value) => {
      if (event === 'update:context') {
        setOptionGroups(value.options)
      }
    });

    studioApi.current.send('request:update:context')

    return () => unsubscribe();
  }, []);


  const filtered = useMemo(() => {
    return optionGroups
      .filter(group => group.options.filter(option => option.name.toLowerCase().includes(search.toLowerCase())).length > 0)
      .map(group => ({
        ...group,
        options: group.options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
      }));
  }, [optionGroups, search])


  return (
    <div className='w-full h-full flex flex-col border-r border-background shadow'>
      <div className='p-1 flex justify-between items-center'>
        <h1>Context</h1>
      </div>

      <hr className='w-full border-t shrink-0' />

      <div className='flex flex-col gap-2 p-2 py-1'>
        <input
          type='search'
          value={search}
          placeholder='Search...'
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <hr className='w-full border-t shrink-0' />

      <div className='overflow-auto flex-1 flex flex-col pb-10'>
        {filtered.length === 0 && (
          <p className='text-xs text-center font-light italic p-1'>
            Nothing found...
          </p>
        )}
        {filtered.map(group => (
          <div key={group.id} className='flex flex-col'>
            <p
              title={group.description}
              className='font-bold text-xs p-1 px-2'
            >
              {group.name}
            </p>
            {group.options.map(option => (
              <ContextOption
                key={option.id}
                option={option}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
