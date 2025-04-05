// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HealthRecords
 * @dev A smart contract for managing patient health records with secure access control
 */
contract HealthRecords is Ownable, ReentrancyGuard {
    // Structures
    struct Record {
        string ipfsHash;         // IPFS hash where encrypted data is stored
        string recordType;       // Type of medical record (e.g., "Prescription", "Lab Result", "Diagnosis")
        uint256 timestamp;       // When the record was created
        string metadata;         // JSON metadata about the record (date, provider, etc.)
        bool exists;             // Flag to check if record exists
    }
    
    struct AccessRequest {
        address requester;       // Address of healthcare provider requesting access
        uint256 requestTime;     // When access was requested
        uint256 expiryTime;      // When access expires
        bool approved;           // If request is approved
    }
    
    struct AccessLog {
        address accessor;        // Who accessed the record
        uint256 accessTime;      // When the record was accessed
        string recordId;         // Which record was accessed
    }
    
    // Mappings
    mapping(address => mapping(string => Record)) private patientRecords;         // Patient address => record ID => Record
    mapping(address => string[]) private patientRecordIds;                        // Patient address => array of their record IDs
    
    mapping(address => mapping(address => AccessRequest)) private accessRequests; // Patient address => provider address => AccessRequest
    mapping(address => address[]) private authorizedProviders;                    // Patient address => array of authorized providers
    
    mapping(address => AccessLog[]) private accessLogs;                           // Patient address => array of access logs
    
    // Events
    event RecordAdded(address indexed patient, string recordId, string recordType, uint256 timestamp);
    event RecordUpdated(address indexed patient, string recordId, uint256 timestamp);
    event AccessRequested(address indexed patient, address indexed provider, uint256 expiryTime);
    event AccessGranted(address indexed patient, address indexed provider, uint256 expiryTime);
    event AccessRevoked(address indexed patient, address indexed provider);
    event RecordAccessed(address indexed patient, address indexed accessor, string recordId, uint256 timestamp);
    
    // Modifiers
    modifier onlyAuthorized(address patient, string memory recordId) {
        require(
            msg.sender == patient || 
            (accessRequests[patient][msg.sender].approved && 
             accessRequests[patient][msg.sender].expiryTime >= block.timestamp),
            "Not authorized to access this record"
        );
        _;
        
        // Log the access if not the patient themselves
        if (msg.sender != patient) {
            accessLogs[patient].push(AccessLog({
                accessor: msg.sender,
                accessTime: block.timestamp,
                recordId: recordId
            }));
            
            emit RecordAccessed(patient, msg.sender, recordId, block.timestamp);
        }
    }
    
    /**
     * @dev Add a new medical record
     * @param recordId Unique identifier for the record
     * @param ipfsHash IPFS hash where the encrypted data is stored
     * @param recordType Type of medical record
     * @param metadata Additional information about the record (JSON string)
     */
    function addRecord(
        string memory recordId,
        string memory ipfsHash,
        string memory recordType,
        string memory metadata
    ) external nonReentrant {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!patientRecords[msg.sender][recordId].exists, "Record already exists");
        
        patientRecords[msg.sender][recordId] = Record({
            ipfsHash: ipfsHash,
            recordType: recordType,
            timestamp: block.timestamp,
            metadata: metadata,
            exists: true
        });
        
        patientRecordIds[msg.sender].push(recordId);
        
        emit RecordAdded(msg.sender, recordId, recordType, block.timestamp);
    }
    
    /**
     * @dev Update an existing medical record
     * @param recordId Unique identifier for the record
     * @param ipfsHash New IPFS hash
     * @param metadata Updated metadata
     */
    function updateRecord(
        string memory recordId,
        string memory ipfsHash,
        string memory metadata
    ) external nonReentrant {
        require(patientRecords[msg.sender][recordId].exists, "Record does not exist");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        Record storage record = patientRecords[msg.sender][recordId];
        record.ipfsHash = ipfsHash;
        record.metadata = metadata;
        record.timestamp = block.timestamp;
        
        emit RecordUpdated(msg.sender, recordId, block.timestamp);
    }
    
    /**
     * @dev Get a specific record
     * @param patient The patient's address
     * @param recordId Unique identifier for the record
     * @return The record details
     */
    function getRecord(address patient, string memory recordId) 
        external 
        view 
        onlyAuthorized(patient, recordId) 
        returns (Record memory) 
    {
        require(patientRecords[patient][recordId].exists, "Record does not exist");
        return patientRecords[patient][recordId];
    }
    
    /**
     * @dev Get all record IDs for a patient
     * @param patient The patient's address
     * @return Array of record IDs
     */
    function getRecordIds(address patient) 
        external 
        view 
        onlyAuthorized(patient, "all") 
        returns (string[] memory) 
    {
        return patientRecordIds[patient];
    }
    
    /**
     * @dev Request access to a patient's records
     * @param patient The patient's address
     * @param durationInDays How long the access should last
     */
    function requestAccess(address patient, uint256 durationInDays) external nonReentrant {
        require(patient != msg.sender, "Cannot request access to your own records");
        require(durationInDays > 0 && durationInDays <= 30, "Duration must be between 1 and 30 days");
        
        uint256 expiryTime = block.timestamp + (durationInDays * 1 days);
        
        accessRequests[patient][msg.sender] = AccessRequest({
            requester: msg.sender,
            requestTime: block.timestamp,
            expiryTime: expiryTime,
            approved: false
        });
        
        emit AccessRequested(patient, msg.sender, expiryTime);
    }
    
    /**
     * @dev Grant access to a healthcare provider
     * @param provider The provider's address
     * @param approve Whether to approve or reject the request
     */
    function manageAccess(address provider, bool approve) external nonReentrant {
        require(accessRequests[msg.sender][provider].requester == provider, "No pending request from this provider");
        
        AccessRequest storage request = accessRequests[msg.sender][provider];
        request.approved = approve;
        
        if (approve) {
            bool alreadyAuthorized = false;
            for (uint i = 0; i < authorizedProviders[msg.sender].length; i++) {
                if (authorizedProviders[msg.sender][i] == provider) {
                    alreadyAuthorized = true;
                    break;
                }
            }
            
            if (!alreadyAuthorized) {
                authorizedProviders[msg.sender].push(provider);
            }
            
            emit AccessGranted(msg.sender, provider, request.expiryTime);
        } else {
            emit AccessRevoked(msg.sender, provider);
        }
    }
    
    /**
     * @dev Revoke previously granted access
     * @param provider The provider's address
     */
    function revokeAccess(address provider) external nonReentrant {
        AccessRequest storage request = accessRequests[msg.sender][provider];
        require(request.approved, "Provider does not have access");
        
        request.approved = false;
        request.expiryTime = block.timestamp;
        
        // Remove from authorized providers array
        for (uint i = 0; i < authorizedProviders[msg.sender].length; i++) {
            if (authorizedProviders[msg.sender][i] == provider) {
                // Replace with the last element and pop
                authorizedProviders[msg.sender][i] = authorizedProviders[msg.sender][authorizedProviders[msg.sender].length - 1];
                authorizedProviders[msg.sender].pop();
                break;
            }
        }
        
        emit AccessRevoked(msg.sender, provider);
    }
    
    /**
     * @dev Get all authorized providers for a patient
     * @return Array of provider addresses
     */
    function getAuthorizedProviders() external view returns (address[] memory) {
        return authorizedProviders[msg.sender];
    }
    
    /**
     * @dev Get access logs for patient records
     * @return Array of access logs
     */
    function getAccessLogs() external view returns (AccessLog[] memory) {
        return accessLogs[msg.sender];
    }
    
    /**
     * @dev Check if a provider has access to a patient's records
     * @param patient The patient's address
     * @param provider The provider's address
     * @return Whether the provider has active access
     */
    function checkAccess(address patient, address provider) external view returns (bool) {
        AccessRequest memory request = accessRequests[patient][provider];
        return request.approved && request.expiryTime >= block.timestamp;
    }
}