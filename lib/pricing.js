// Pricing configuration based on table area/location (in INR)
export const AREA_PRICING = {
  'indoor': 500,        // ₹500 per person
  'outdoor': 600,       // ₹600 per person
  'private-room': 1000, // ₹1000 per person
  'bar-area': 400,      // ₹400 per person
  'patio': 700,         // ₹700 per person
  'rooftop': 900,       // ₹900 per person
}

export const calculateBookingPrice = (numberOfGuests, tableArea = 'indoor') => {
  const pricePerPerson = AREA_PRICING[tableArea] || AREA_PRICING['indoor']
  return numberOfGuests * pricePerPerson
}

export const getAreaDisplayName = (area) => {
  const displayNames = {
    'indoor': 'Indoor Dining',
    'outdoor': 'Outdoor Dining',
    'private-room': 'Private Room',
    'bar-area': 'Bar Area',
    'patio': 'Patio',
    'rooftop': 'Rooftop',
  }
  return displayNames[area] || area
}
