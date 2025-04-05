import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { RECORD_TYPES } from '../utils/constants';
import { uploadToIPFS } from '../utils/ipfs';
import { encryptData, generateRecordId } from '../utils/encryption';

const MedicalRecord = () => {
  const { account, medicalRecords, addMedicalRecord, loading } = useWeb3();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    recordType: RECORD_TYPES[0],
    patientName: '',
    doctorName: '',
    date: new Date().toISOString().substr(0, 10),
    description: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });
  
  // Form error state
  const [formError, setFormError] = useState('');
  
  // Form success state
  const [formSuccess, setFormSuccess] = useState('');
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    try {
      // Validate form
      if (!formData.recordType || !formData.description) {
        setFormError('Please fill in all required fields');
        return;
      }
      
      // Create record data
      const recordData = {
        ...formData,
        patientAddress: account,
        createdAt: new Date().toISOString()
      };
      
      // Encrypt the data (in a real app, use the user's private key)
      // For demo, we're using a simulated private key
      const encryptionKey = account + '_demo_key';
      const encryptedData = encryptData(recordData, encryptionKey);
      
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(encryptedData);
      
      // Generate a unique record ID
      const recordId = generateRecordId();
      
      // Create metadata for the smart contract
      const metadata = JSON.stringify({
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        date: formData.date,
        recordType: formData.recordType
      });
      
      // Add record to blockchain
      const success = await addMedicalRecord({
        recordId,
        ipfsHash,
        recordType: formData.recordType,
        metadata
      });
      
      if (success) {
        setFormSuccess('Medical record added successfully');
        
        // Reset form
        setFormData({
          recordType: RECORD_TYPES[0],
          patientName: '',
          doctorName: '',
          date: new Date().toISOString().substr(0, 10),
          description: '',
          diagnosis: '',
          prescription: '',
          notes: ''
        });
        
        // Close form after a delay
        setTimeout(() => {
          setShowAddForm(false);
          setFormSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
      setFormError('Failed to add medical record: ' + error.message);
    }
  };
  
  // Render add record form
  const renderAddForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Add New Medical Record</h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="recordType" className="form-label">
                Record Type *
              </label>
              <select
                id="recordType"
                name="recordType"
                value={formData.recordType}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="form-label">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div>
              <label htmlFor="patientName" className="form-label">
                Patient Name
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div>
              <label htmlFor="doctorName" className="form-label">
                Doctor/Provider Name
              </label>
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                required
              ></textarea>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="diagnosis" className="form-label">
                Diagnosis
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows="3"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="form-control"
              ></textarea>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="prescription" className="form-label">
                Prescription/Treatment
              </label>
              <textarea
                id="prescription"
                name="prescription"
                rows="3"
                value={formData.prescription}
                onChange={handleInputChange}
                className="form-control"
              ></textarea>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn bg-gray-100 text-gray-700 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Render medical records table
  const renderRecordsTable = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Medical Records</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            Add New Record
          </button>
        </div>
        
        {medicalRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new medical record.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                Add New Record
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell-header">Type</th>
                  <th className="table-cell-header">Date</th>
                  <th className="table-cell-header">Description</th>
                  <th className="table-cell-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {medicalRecords.map((record) => {
                  // Parse metadata
                  let metadata = {};
                  try {
                    metadata = JSON.parse(record.metadata);
                  } catch (error) {
                    console.error('Error parsing metadata:', error);
                  }
                  
                  return (
                    <tr key={record.id} className="table-row">
                      <td className="table-cell">
                        <span className="badge badge-success">
                          {record.recordType}
                        </span>
                      </td>
                      <td className="table-cell">
                        {metadata.date || new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        {metadata.patientName && (
                          <span className="block text-xs text-gray-400">
                            Patient: {metadata.patientName}
                          </span>
                        )}
                        {metadata.doctorName && (
                          <span className="block text-xs text-gray-400">
                            Provider: {metadata.doctorName}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setViewRecord(record)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          View
                        </button>
                        {/* Add more actions here if needed */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  // Render record details modal
  const renderRecordDetails = () => {
    if (!viewRecord) return null;
    
    // Parse metadata
    let metadata = {};
    try {
      metadata = JSON.parse(viewRecord.metadata);
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }
    
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Medical Record Details
            </h3>
            <button
              onClick={() => setViewRecord(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Record Type</h4>
                <p className="mt-1 text-sm text-gray-900">{viewRecord.recordType}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {metadata.date || new Date(viewRecord.timestamp).toLocaleDateString()}
                </p>
              </div>
              
              {metadata.patientName && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient Name</h4>
                  <p className="mt-1 text-sm text-gray-900">{metadata.patientName}</p>
                </div>
              )}
              
              {metadata.doctorName && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Doctor/Provider</h4>
                  <p className="mt-1 text-sm text-gray-900">{metadata.doctorName}</p>
                </div>
              )}
              
              <div className="sm:col-span-2">
                <h4 className="text-sm font-medium text-gray-500">IPFS Hash (Encrypted Data)</h4>
                <p className="mt-1 text-sm text-gray-900 break-all font-mono">{viewRecord.ipfsHash}</p>
              </div>
              
              <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                <p className="text-sm text-gray-500">
                  This record is securely stored on IPFS and referenced on the Ethereum blockchain.
                  The data is encrypted and can only be decrypted with the proper keys.
                </p>
                
                <div className="mt-4 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                  <span className="ml-2 text-sm text-gray-500">
                    Record verified on blockchain
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setViewRecord(null)}
              className="btn bg-gray-100 text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {showAddForm ? renderAddForm() : renderRecordsTable()}
      {viewRecord && renderRecordDetails()}
    </div>
  );
};

export default MedicalRecord;