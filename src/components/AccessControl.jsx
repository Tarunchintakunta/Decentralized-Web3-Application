import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ACCESS_DURATIONS } from '../utils/constants';

const AccessControl = () => {
  const { 
    account, 
    contract, 
    // accessRequests, 
    fetchAccessRequests, 
    requestAccess, 
    manageAccess, 
    revokeAccess, 
    loading, 
    error 
  } = useWeb3();

  // State for access management
  const [viewMode, setViewMode] = useState('received'); // 'received' or 'requested'
  
  // State for access request form
  const [requestForm, setRequestForm] = useState({
    patientAddress: '',
    duration: 7, // Default to 7 days
    purpose: ''
  });
  
  // State for form messages
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Refresh data when component mounts
  useEffect(() => {
    if (account && contract) {
      fetchAccessRequests();
    }
  }, [account, contract, fetchAccessRequests]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };
  
  // Handle request form submission
  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    try {
      // Validate form
      if (!requestForm.patientAddress) {
        setFormError('Please enter a patient address');
        return;
      }
      
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(requestForm.patientAddress)) {
        setFormError('Please enter a valid Ethereum address');
        return;
      }
      
      // Ensure not requesting access to self
      if (requestForm.patientAddress.toLowerCase() === account.toLowerCase()) {
        setFormError('You cannot request access to your own records');
        return;
      }
      
      // Request access
      const success = await requestAccess(
        requestForm.patientAddress,
        parseInt(requestForm.duration)
      );
      
      if (success) {
        setFormSuccess(`Access request sent successfully to ${requestForm.patientAddress}`);
        
        // Reset form
        setRequestForm({
          patientAddress: '',
          duration: 7,
          purpose: ''
        });
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      setFormError('Failed to request access: ' + error.message);
    }
  };
  
  // Handle approving access request
  const handleApproveAccess = async (providerAddress) => {
    try {
      const success = await manageAccess(providerAddress, true);
      if (success) {
        await fetchAccessRequests();
      }
    } catch (error) {
      console.error('Error approving access:', error);
    }
  };
  
  // Handle rejecting access request
  const handleRejectAccess = async (providerAddress) => {
    try {
      const success = await manageAccess(providerAddress, false);
      if (success) {
        await fetchAccessRequests();
      }
    } catch (error) {
      console.error('Error rejecting access:', error);
    }
  };
  
  // Handle revoking previously granted access
  const handleRevokeAccess = async (providerAddress) => {
    try {
      const success = await revokeAccess(providerAddress);
      if (success) {
        await fetchAccessRequests();
      }
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Render tabs for switching between received and requested access
  const renderTabs = () => {
    return (
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setViewMode('received')}
              className={`py-2 px-4 text-sm font-medium ${
                viewMode === 'received'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Received Requests
            </button>
            <button
              onClick={() => setViewMode('requested')}
              className={`ml-8 py-2 px-4 text-sm font-medium ${
                viewMode === 'requested'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Access
            </button>
          </nav>
        </div>
      </div>
    );
  };
  
  // Render the request access form
  const renderRequestForm = () => {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Patient Record Access</h3>
        
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            {formSuccess}
          </div>
        )}
        
        <form onSubmit={handleRequestAccess}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="patientAddress" className="form-label">
                Patient Ethereum Address *
              </label>
              <input
                type="text"
                id="patientAddress"
                name="patientAddress"
                value={requestForm.patientAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="form-control"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the Ethereum address of the patient whose records you wish to access.
              </p>
            </div>
            
            <div>
              <label htmlFor="duration" className="form-label">
                Access Duration *
              </label>
              <select
                id="duration"
                name="duration"
                value={requestForm.duration}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                {ACCESS_DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="purpose" className="form-label">
                Purpose of Access
              </label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={requestForm.purpose}
                onChange={handleInputChange}
                placeholder="Treatment, consultation, etc."
                className="form-control"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Send Access Request'}
            </button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Important Information</h4>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
            <p className="text-sm">
              By requesting access to patient records, you agree to:
            </p>
            <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
              <li>Only access records that are necessary for patient care</li>
              <li>Maintain confidentiality of all patient information</li>
              <li>Comply with all applicable privacy laws and regulations</li>
              <li>Only use the information for the stated purpose</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the received access requests
  const renderReceivedRequests = () => {
    // In a real app, you would fetch the pending requests from the contract
    // For this demo, we'll use mock data
    const mockPendingRequests = [
      {
        provider: '0x1234567890123456789012345678901234567890',
        requestTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'pending'
      },
      {
        provider: '0x2345678901234567890123456789012345678901',
        requestTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'pending'
      }
    ];
    
    const mockApprovedRequests = [
      {
        provider: '0x3456789012345678901234567890123456789012',
        requestTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        expiryTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // expires in 4 days
        status: 'approved'
      }
    ];
    
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Access Requests</h3>
        
        <div className="space-y-8">
          {/* Pending requests */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Pending Requests</h4>
            
            {mockPendingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No pending access requests.</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                  {mockPendingRequests.map((request, index) => (
                    <li key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatAddress(request.provider)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Requested {new Date(request.requestTime).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveAccess(request.provider)}
                            className="btn bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAccess(request.provider)}
                            className="btn bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Approved requests */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Approved Access</h4>
            
            {mockApprovedRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No approved access requests.</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                  {mockApprovedRequests.map((request, index) => (
                    <li key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatAddress(request.provider)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Approved until {new Date(request.expiryTime).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRevokeAccess(request.provider)}
                          className="btn bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-3 text-sm text-gray-500">Loading...</span>
        </div>
      ) : (
        <>
          {renderTabs()}
          {viewMode === 'received' ? renderReceivedRequests() : renderRequestForm()}
        </>
      )}
    </div>
  );
};

export default AccessControl;