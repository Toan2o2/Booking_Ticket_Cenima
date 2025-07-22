import React from 'react';
import AppRoutes from './routes';
import { Button, message } from 'antd';

function TestMessage() {
  return <Button onClick={() => message.info("Test message")}>Test Message</Button>;
}

function App() {
  return (
    <>
      <AppRoutes />
      <TestMessage />
    </>
  );
}

export default App;
