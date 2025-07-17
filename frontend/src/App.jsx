import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WalletProvider from './providers/WalletProvider';
import Header from './components/Header'; // Import the new Header
import HomePage from './pages/HomePage';
import AccessPortal from './pages/AccessPortal';
import './App.css'; 

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="app-container">
          <Header /> {/* Add the Header component here */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/portal" element={<AccessPortal />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
