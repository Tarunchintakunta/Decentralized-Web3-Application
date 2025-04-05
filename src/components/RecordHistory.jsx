import React, { useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const RecordHistory = () => {
  const { account, fetchAccessLogs, loading, error } = useWeb3();
  
  // Fetch access logs when component mounts
  useEffect(() => {
    if (account) {
      fetchAccessLogs();
    }
  }, [account, fetchAccessLogs]);
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Mock access logs for the demo
  // In a real app, these would come from the blockchain
  const mockAccessLogs = [
    {
      accessor: '0x1234567890123456789012345678901234567890',
      accessTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      recordId: 'record_1649801234567_a1b2c3',
      recordType: 'Lab Results'
    },
    {
      accessor: '0x1234567890123456789012345678901234567890',
      accessTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      recordId: 'record_1649801234567_d4e5f6',
      recordType: 'Prescription'
    },
    {
      accessor: '0x3456789012345678901234567890123456789012',
      accessTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      recordId: 'record_1649701234567_g7h8i9',
      recordType: 'Physical Examination'
    }
  ];
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Record Access History</h3>
      
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
          <span className="ml-3 text-sm text-gray-500">Loading access logs...</span>
        </div>
      ) : mockAccessLogs.length === 0 ? (
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No access history</h3>
          <p className="mt-1 text-sm text-gray-500">
            When healthcare providers access your records, their activity will be recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Provider
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Record Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Access Time
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Record ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockAccessLogs.map((log, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {formatAddress(log.accessor)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {log.recordType}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(log.accessTime).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="font-mono text-xs">{log.recordId.substring(0, 10)}...</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <p>
              This audit trail is immutably stored on the blockchain, ensuring a tamper-proof record of all access to your medical data.
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Access History</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page shows a complete log of all accesses to your medical records. 
                Each entry includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The healthcare provider who accessed your records</li>
                <li>Which record was accessed</li>
                <li>The exact time of access</li>
                <li>A unique identifier for the record</li>
              </ul>
              <p className="mt-2">
                All access events are recorded on the blockchain, creating a permanent, 
                immutable audit trail that helps ensure your medical data privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordHistory;