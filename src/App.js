import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Faucet from './components/Faucet';
import Membership from './components/Membership';
import Governanace from './components/Governanace';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/season3" element={<Faucet />} />
        <Route path="/season3/chat" element={<Chatbot />} />
        <Route path="/season3/nft" element={<Membership />} />
        <Route path="/season3/vote" element={<Governanace />} />
      </Routes>
    </Router>
  );
}

export default App;
