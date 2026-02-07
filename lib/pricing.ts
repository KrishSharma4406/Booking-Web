import type { TableLocation } from '@/types/models'

// Pricing configuration based on table area/location (in INR)
export const AREA_PRICING: Record<TableLocation, number> = {
  'indoor': 500,        // Rs.500 per person
  'outdoor': 600,       // Rs.600 per person
  'private-room': 1000, // Rs.1000 per person
  'bar-area': 400,      // Rs.400 per person
  'patio': 700,         // Rs.700 per person
  'rooftop': 900,       // Rs.900 per person
}

export const calculateBookingPrice = (numberOfGuests: number, tableArea: string = 'indoor'): number => {
  const pricePerPerson: number = AREA_PRICING[tableArea as TableLocation] || AREA_PRICING['indoor']
  return numberOfGuests * pricePerPerson
}

export const getAreaDisplayName = (area: string): string => {
  const displayNames: Record<string, string> = {
    'indoor': 'Indoor Dining',
    'outdoor': 'Outdoor Dining',
    'private-room': 'Private Room',
    'bar-area': 'Bar Area',
    'patio': 'Patio',
    'rooftop': 'Rooftop',
  }
  return displayNames[area] || area
}
