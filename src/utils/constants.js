// Record types for the healthcare application
export const RECORD_TYPES = [
    'Physical Examination',
    'Lab Results',
    'Prescription',
    'Diagnosis',
    'Vaccination',
    'Allergy Information',
    'Treatment Plan',
    'Medical Imaging',
    'Surgery',
    'Mental Health Evaluation',
    'Dental Records'
  ];
  
  // Access durations in days
  export const ACCESS_DURATIONS = [
    { value: 1, label: '1 Day' },
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' }
  ];
  
  // Network IDs and names
  export const NETWORKS = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Local Testnet'
  };
  
  // Sample provider roles for dropdown
  export const PROVIDER_ROLES = [
    'Primary Care Physician',
    'Specialist',
    'Hospital',
    'Laboratory',
    'Pharmacy',
    'Insurance',
    'Emergency Service'
  ];
  
  // Links for help and documentation
  export const DOCS_LINKS = {
    patientGuide: 'https://example.com/patient-guide',
    providerGuide: 'https://example.com/provider-guide',
    privacyPolicy: 'https://example.com/privacy-policy',
    termsOfService: 'https://example.com/terms-of-service',
    support: 'https://example.com/support'
  };
  
  // App-wide configuration
  export const APP_CONFIG = {
    appName: 'HealthChain',
    appDescription: 'Secure, decentralized medical records management',
    ipfsGateway: 'https://ipfs.io/ipfs/'
  };
  
  // Health metrics for visualization
  export const HEALTH_METRICS = {
    bloodPressure: {
      name: 'Blood Pressure',
      unit: 'mmHg',
      normalRange: '90/60 - 120/80'
    },
    bloodGlucose: {
      name: 'Blood Glucose',
      unit: 'mg/dL',
      normalRange: '80 - 130'
    },
    heartRate: {
      name: 'Heart Rate',
      unit: 'bpm',
      normalRange: '60 - 100'
    },
    cholesterol: {
      name: 'Cholesterol',
      unit: 'mg/dL',
      normalRange: 'HDL: >40, LDL: <100'
    },
    bodyTemperature: {
      name: 'Body Temperature',
      unit: '°F',
      normalRange: '97.8 - 99.1'
    },
    respiratoryRate: {
      name: 'Respiratory Rate',
      unit: 'breaths/min',
      normalRange: '12 - 20'
    },
    oxygenSaturation: {
      name: 'Oxygen Saturation',
      unit: '%',
      normalRange: '95 - 100'
    }
  };
  
  // Permission levels
  export const PERMISSION_LEVELS = {
    VIEW: 'view',
    EDIT: 'edit',
    FULL: 'full'
  };
  
  // Status codes for medical records
  export const RECORD_STATUS = {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    PENDING: 'pending',
    DELETED: 'deleted'
  };