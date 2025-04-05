import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import HealthRecords from '../artifacts/contracts/HealthRecords.sol/HealthRecords.json';

// Create context
const Web3Context = createContext();

// Contract address (from environment variable)
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const Web3Provider = ({ children }) => {
  // State variables
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);

  // Initialize Web3Modal
  const web3Modal = new Web3Modal({
    network: 'sepolia', // optional
    cacheProvider: true, // optional
    providerOptions: {}, // required
  });

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Connect to wallet
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      const account = await signer.getAddress();
      
      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        HealthRecords.abi,
        signer
      );
      
      // Set state
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(account);
      setNetwork(network);
      
      // Setup event listeners
      instance.on('accountsChanged', handleAccountsChanged);
      instance.on('chainChanged', handleChainChanged);
      instance.on('disconnect', handleDisconnect);
      
      // Fetch initial data
      if (contract) {
        await fetchMedicalRecords(contract, account);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet');
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    resetState();
  };

  // Reset state on disconnect
  const resetState = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setNetwork(null);
    setMedicalRecords([]);
    setAccessRequests([]);
    setAccessLogs([]);
  };

  // Event Handlers
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      resetState();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (contract) {
        fetchMedicalRecords(contract, accounts[0]);
      }
    }
  };

  const handleChainChanged = () => {
    // Reload the page when they change networks
    window.location.reload();
  };

  const handleDisconnect = () => {
    resetState();
  };

  // Fetch medical records from the contract
  const fetchMedicalRecords = async (contractInstance, userAccount) => {
    try {
      setLoading(true);
      
      // Get record IDs
      const recordIds = await contractInstance.getRecordIds(userAccount);
      
      // Fetch each record
      const records = await Promise.all(
        recordIds.map(async (id) => {
          const record = await contractInstance.getRecord(userAccount, id);
          return {
            id,
            ipfsHash: record.ipfsHash,
            recordType: record.recordType,
            timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString(),
            metadata: record.metadata,
          };
        })
      );
      
      setMedicalRecords(records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setError('Failed to fetch medical records');
      setLoading(false);
    }
  };

  // Fetch access requests
  const fetchAccessRequests = async () => {
    try {
      setLoading(true);
      
      // Get authorized providers
      const providers = await contract.getAuthorizedProviders();
      
      // We'd need to query each provider's request details
      // This is simplified and would need enhancement for production
      setAccessRequests(providers);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      setError('Failed to fetch access requests');
      setLoading(false);
    }
  };

  // Fetch access logs
  const fetchAccessLogs = async () => {
    try {
      setLoading(true);
      
      // Get access logs
      const logs = await contract.getAccessLogs();
      
      // Format logs
      const formattedLogs = logs.map(log => ({
        accessor: log.accessor,
        accessTime: new Date(log.accessTime.toNumber() * 1000).toLocaleString(),
        recordId: log.recordId,
      }));
      
      setAccessLogs(formattedLogs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      setError('Failed to fetch access logs');
      setLoading(false);
    }
  };

  // Add a medical record
  const addMedicalRecord = async (recordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { recordId, ipfsHash, recordType, metadata } = recordData;
      
      // Call contract function
      const tx = await contract.addRecord(recordId, ipfsHash, recordType, metadata);
      await tx.wait();
      
      // Refresh records
      await fetchMedicalRecords(contract, account);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error adding medical record:', error);
      setError('Failed to add medical record');
      setLoading(false);
      return false;
    }
  };

  // Update a medical record
  const updateMedicalRecord = async (recordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { recordId, ipfsHash, metadata } = recordData;
      
      // Call contract function
      const tx = await contract.updateRecord(recordId, ipfsHash, metadata);
      await tx.wait();
      
      // Refresh records
      await fetchMedicalRecords(contract, account);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating medical record:', error);
      setError('Failed to update medical record');
      setLoading(false);
      return false;
    }
  };

  // Request access to another patient's records
  const requestAccess = async (patientAddress, durationInDays) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call contract function
      const tx = await contract.requestAccess(patientAddress, durationInDays);
      await tx.wait();
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error requesting access:', error);
      setError('Failed to request access');
      setLoading(false);
      return false;
    }
  };

  // Manage (approve/reject) access request
  const manageAccess = async (providerAddress, approve) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call contract function
      const tx = await contract.manageAccess(providerAddress, approve);
      await tx.wait();
      
      // Refresh access requests
      await fetchAccessRequests();
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error managing access:', error);
      setError('Failed to manage access');
      setLoading(false);
      return false;
    }
  };

  // Revoke access from a provider
  const revokeAccess = async (providerAddress) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call contract function
      const tx = await contract.revokeAccess(providerAddress);
      await tx.wait();
      
      // Refresh access requests
      await fetchAccessRequests();
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      setError('Failed to revoke access');
      setLoading(false);
      return false;
    }
  };

  // Auto-connect if cached provider exists
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  // Fetch data when account or contract changes
  useEffect(() => {
    if (contract && account) {
      fetchMedicalRecords(contract, account);
      fetchAccessRequests();
      fetchAccessLogs();
    }
  }, [contract, account]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        network,
        loading,
        error,
        medicalRecords,
        accessRequests,
        accessLogs,
        connectWallet,
        disconnectWallet,
        addMedicalRecord,
        updateMedicalRecord,
        requestAccess,
        manageAccess,
        revokeAccess,
        fetchMedicalRecords,
        fetchAccessRequests,
        fetchAccessLogs,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook for using the Web3 context
export const useWeb3 = () => useContext(Web3Context);

export default Web3Context;