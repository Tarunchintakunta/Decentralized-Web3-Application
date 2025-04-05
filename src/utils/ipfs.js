import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

/**
 * Configure IPFS client with Infura or other IPFS node
 * Note: This requires project ID and secret when using Infura
 */
const createIPFSClient = () => {
  const projectId = import.meta.env.VITE_IPFS_PROJECT_ID;
  const projectSecret = import.meta.env.VITE_IPFS_PROJECT_SECRET;
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  return create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });
};

/**
 * Upload data to IPFS
 * @param {Object|string} data - Data to store on IPFS
 * @returns {Promise<string>} - IPFS content identifier (CID)
 */
export const uploadToIPFS = async (data) => {
  try {
    // Create client
    const ipfs = createIPFSClient();
    
    // Convert data to string if it's an object
    const content = typeof data === 'object' ? JSON.stringify(data) : data;
    
    // Upload to IPFS
    const result = await ipfs.add(Buffer.from(content));
    
    // Return the CID (Content Identifier)
    return result.path;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

/**
 * Retrieve data from IPFS
 * @param {string} cid - IPFS content identifier
 * @param {boolean} parseJson - Whether to parse the result as JSON
 * @returns {Promise<Object|string>} - Retrieved data
 */
export const getFromIPFS = async (cid, parseJson = true) => {
  try {
    // Create client
    const ipfs = createIPFSClient();
    
    // Get data from IPFS
    const asyncIterable = ipfs.cat(cid);
    
    // Collect all chunks
    const chunks = [];
    for await (const chunk of asyncIterable) {
      chunks.push(chunk);
    }
    
    // Combine chunks and decode to string
    const data = Buffer.concat(chunks).toString();
    
    // Parse as JSON if requested
    return parseJson ? JSON.parse(data) : data;
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
};

/**
 * Create a gateway URL for an IPFS resource
 * @param {string} cid - IPFS content identifier
 * @returns {string} - Gateway URL
 */
export const getIPFSGatewayUrl = (cid) => {
  if (!cid) return '';
  return `https://ipfs.io/ipfs/${cid}`;
};

/**
 * Store encrypted medical record on IPFS
 * @param {Object} record - Medical record data
 * @param {string} encryptedData - Encrypted data string
 * @returns {Promise<Object>} - Record metadata with IPFS CID
 */
export const storeEncryptedRecord = async (record, encryptedData) => {
  try {
    // Store the encrypted data
    const cid = await uploadToIPFS(encryptedData);
    
    // Create metadata object
    const metadata = {
      recordType: record.recordType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientAddress: record.patientAddress,
      ipfsCid: cid,
      version: '1.0',
    };
    
    return metadata;
  } catch (error) {
    console.error('Storing encrypted record error:', error);
    throw new Error('Failed to store encrypted record');
  }
};

/**
 * Fallback method to retrieve IPFS content using gateway
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<string>} - Raw content string
 */
export const fetchFromIPFSGateway = async (cid) => {
  try {
    const gatewayUrl = getIPFSGatewayUrl(cid);
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('IPFS gateway fetch error:', error);
    throw new Error('Failed to fetch from IPFS gateway');
  }
};