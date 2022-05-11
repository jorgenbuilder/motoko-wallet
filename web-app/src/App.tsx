import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Messages from 'ui/messages';
import Modal from 'ui/modal';
import ScrollToTop from 'ui/scroll-to-top';
import HomePage from 'pages/home';
import useConnect from 'stores/connect';
import useMessageStore from 'stores/messages';

function App() {
  const { init } = useConnect();
  const { init : mInit } = useMessageStore();
  React.useEffect(() => {
    init();
    mInit()
  }, []);
  return <>
      <Routes>
          <Route path="/" element={<HomePage />} />
      </Routes>
      <Messages />
      <ScrollToTop />
      <Modal />
  </>
}

export default App
