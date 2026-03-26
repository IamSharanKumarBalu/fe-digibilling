// Indian State Codes for GST
export const STATE_CODES = {
  'JAMMU AND KASHMIR': '01',
  'HIMACHAL PRADESH': '02',
  'PUNJAB': '03',
  'CHANDIGARH': '04',
  'UTTARAKHAND': '05',
  'HARYANA': '06',
  'DELHI': '07',
  'RAJASTHAN': '08',
  'UTTAR PRADESH': '09',
  'BIHAR': '10',
  'SIKKIM': '11',
  'ARUNACHAL PRADESH': '12',
  'NAGALAND': '13',
  'MANIPUR': '14',
  'MIZORAM': '15',
  'TRIPURA': '16',
  'MEGHALAYA': '17',
  'ASSAM': '18',
  'WEST BENGAL': '19',
  'JHARKHAND': '20',
  'ODISHA': '21',
  'CHHATTISGARH': '22',
  'MADHYA PRADESH': '23',
  'GUJARAT': '24',
  'DAMAN AND DIU': '25',
  'DADRA AND NAGAR HAVELI': '26',
  'MAHARASHTRA': '27',
  'ANDHRA PRADESH': '28',
  'KARNATAKA': '29',
  'GOA': '30',
  'LAKSHADWEEP': '31',
  'KERALA': '32',
  'TAMIL NADU': '33',
  'PUDUCHERRY': '34',
  'ANDAMAN AND NICOBAR ISLANDS': '35',
  'TELANGANA': '36',
  'LADAKH': '37',
  'JAMMU & KASHMIR': '01',
  'ANDHRA PRADESH (BEFORE DIVISION)': '37'
};

/**
 * Get state code from state name
 * @param {string} stateName - State name (case insensitive)
 * @returns {string} State code or empty string if not found
 */
export const getStateCode = (stateName) => {
  if (!stateName) return '';
  const normalizedName = stateName.trim().toUpperCase();
  return STATE_CODES[normalizedName] || '';
};

/**
 * Get state name from state code
 * @param {string} stateCode - 2-digit state code
 * @returns {string} State name or empty string if not found
 */
export const getStateName = (stateCode) => {
  if (!stateCode) return '';
  const entry = Object.entries(STATE_CODES).find(([_, code]) => code === stateCode);
  return entry ? entry[0] : '';
};
