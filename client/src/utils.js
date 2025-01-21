export const getCodeFromCountry = (region) => {
  const regionMap = {
    'United States': 'us',
    'Canada': 'ca',
    'Mexico': 'mx',
    'Global': 'global'
  };
  return regionMap[region] || 'global';
}; 