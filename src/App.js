import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Faucet from './components/Faucet';
import Membership from './components/Membership';
import Governanace from './components/Governanace';
import Chatbot from './components/Chatbot';
import Airdrop from './components/Airdrop';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Faucet />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/nft" element={<Membership />} />
        <Route path="/vote" element={<Governanace />} />
        <Route path="/present" element={<Airdrop />} />
      </Routes>
    </Router>
  );
}

export default App;
