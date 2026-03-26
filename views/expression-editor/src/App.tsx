/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react';
import { acquireStudioApi } from 'parsifly-extension-base/web-view';


export function App() {
  const studioApi = useRef(acquireStudioApi());


  useEffect(() => {
    const unsubscribe = studioApi.current.subscribeToMessage(async (_event, value) => console.log(value));
    return () => unsubscribe();
  }, []);


  return (
    <div style={{ flex: 1, backgroundColor: '#303241' }}>
      Expression
    </div>
  );
}
