const getPagination = (page, limit) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip };
};

const formatCoordinates = (lng, lat) => {
  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (isNaN(parsedLng) || isNaN(parsedLat)) return null;
  return {
    type: 'Point',
    coordinates: [parsedLng, parsedLat], // [longitude, latitude]
  };
};

module.exports = {
  getPagination,
  formatCoordinates,
};
