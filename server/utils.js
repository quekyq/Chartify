const regionMap = {
    "north-america": "North America",
    "global": "Global",
};

const countryToRegionMap = {
    "mx": "North America",
    "us": "North America",
    "ca": "North America",
    "global": "Global"
};

const countryToCodeMap = {
    "Mexico": "mx",
    "United States": "us",
    "Canada": "ca",
};

const getRegionQueryValue = (userSelection) => {
    return regionMap[userSelection] || 'Global'; // Default to global
};

const getRegionFromCountry = (userSelection) => {
    return countryToRegionMap[userSelection] || 'Global'; // Default to global
};

const getCodeFromCountry = (userSelection) => {
    return countryToCodeMap[userSelection] || 'global'; // Default to global
};

module.exports = { getRegionQueryValue, getRegionFromCountry, getCodeFromCountry };

