import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { APP_CONFIG, NETWORKS } from '../utils/constants';

const Navbar = () => {
  const { account, network, connectWallet, disconnectWallet } = useWeb3();
  
  // Format address for display (e.g., 0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get network name from ID
  const getNetworkName = (networkId) => {
    return networkId && NETWORKS[networkId?.chainId] 
      ? NETWORKS[networkId.chainId] 
      : 'Unknown Network';
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and app name */}
          <div className="flex-shrink-0 flex items-center">
            <svg 
              className="h-8 w-8 text-primary-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-primary-600">{APP_CONFIG.appName}</span>
          </div>

          {/* Network indicator and wallet connection */}
          <div className="flex items-center">
            {network && (
              <div className="hidden md:flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm mr-4">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  network.chainId === 11155111 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span>{getNetworkName(network)}</span>
              </div>
            )}
            
            {account ? (
              <div className="flex items-center">
                <div className="hidden md:flex mr-4 bg-gray-100 text-gray-800 px-4 py-2 rounded-md">
                  <span>{formatAddress(account)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-outline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;