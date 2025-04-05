import React from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WalletConnect from './components/WalletConnect';

// Main application container
const AppContent = () => {
  const { account } = useWeb3();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {account ? <Dashboard /> : <WalletConnect />}
      </main>
      <footer className="bg-white mt-12 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">About</span>
                <span className="text-sm">About</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Privacy</span>
                <span className="text-sm">Privacy Policy</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Terms</span>
                <span className="text-sm">Terms of Service</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Contact</span>
                <span className="text-sm">Contact</span>
              </a>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-sm text-gray-400 md:text-right">
                &copy; {new Date().getFullYear()} HealthChain. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap the app with Web3 provider
const App = () => {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
};

export default App;