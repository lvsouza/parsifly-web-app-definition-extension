/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useRef, useState } from 'react';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';
import Editor from '@monaco-editor/react';


export function App() {
  const studioApi = useRef(acquireStudioApi());


  const [value, setValue] = useState('');


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (_event, value) => setValue(value));
    return () => unsubscribe();
  }, []);


  const handleChange = useCallback((value: string | undefined) => {
    studioApi.current.send('change', value || '')
  }, [])


  return (
    <Editor
      width='100vw'
      height="100vh"
      theme='vs-dark'
      defaultLanguage="javascript"

      value={value}
      onChange={handleChange}
    />
  );
}
