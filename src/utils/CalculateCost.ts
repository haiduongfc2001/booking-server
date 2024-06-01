interface Room {
  adults: number;
  children: number[];
  cost?: number;
  surcharges: number;
}

interface SurchargeRates {
  [ageRange: string]: number;
}

interface CustomerRequest {
  num_rooms: number;
  num_nights: number;
  num_adults: number;
  num_children: number;
  children_ages: number[];
}

interface HotelPolicy {
  base_price: number;
  room_discount: number;
  standard_occupant: number;
  max_children: number;
  max_occupant: number;
  max_extra_bed: number;
  surcharge_rates: SurchargeRates;
  service_fee: number;
  tax: number;
}

interface CalculationResult {
  room_price_per_night: number;
  total_room_price: number;
  total_service_fee: number;
  total_tax: number;
  final_price: number;
  base_price: number;
  room_discount: number;
  rooms: Room[];
}

const calculateCost = (
  customerRequest: CustomerRequest,
  hotelPolicy: HotelPolicy
): CalculationResult => {
  const { num_rooms, num_adults, num_nights, children_ages } = customerRequest;

  const {
    base_price,
    room_discount,
    standard_occupant,
    max_children,
    max_occupant,
    surcharge_rates,
    service_fee,
    tax,
  } = hotelPolicy;

  const sortedChildren = children_ages.sort((a, b) => b - a); // Sort children by age descending
  const totalRooms = num_rooms;
  const effectiveRoomPrice = base_price - room_discount;

  let rooms: Room[] = Array(totalRooms)
    .fill(null)
    .map(() => ({ adults: 0, children: [], surcharges: 0 }));
  let adultsRemaining = num_adults;
  let childrenRemaining = [...sortedChildren];

  // Step 1: Allocate adults evenly across rooms
  for (let i = 0; i < totalRooms; i++) {
    if (adultsRemaining > 0) {
      rooms[i].adults++;
      adultsRemaining--;
    }
  }

  let roomIndex = 0;
  while (adultsRemaining > 0) {
    rooms[roomIndex].adults++;
    adultsRemaining--;
    roomIndex = (roomIndex + 1) % totalRooms;
  }

  // Step 2: Fill remaining slots with children, prioritizing rooms that are not fully occupied
  for (let i = 0; i < totalRooms; i++) {
    while (
      rooms[i].adults + rooms[i].children.length < standard_occupant &&
      childrenRemaining.length > 0
    ) {
      rooms[i].children.push(childrenRemaining.shift()!);
    }
  }

  // Step 3: Distribute remaining children to rooms while respecting max_occupant and max_children
  for (let i = 0; i < totalRooms; i++) {
    while (
      rooms[i].children.length < max_children &&
      rooms[i].adults + rooms[i].children.length < max_occupant &&
      childrenRemaining.length > 0
    ) {
      rooms[i].children.push(childrenRemaining.shift()!);
    }
  }

  // Step 4: Ensure no room exceeds max_occupant by moving children if necessary
  for (let i = 0; i < totalRooms; i++) {
    while (rooms[i].adults + rooms[i].children.length > max_occupant) {
      for (let j = 0; j < totalRooms; j++) {
        if (
          i !== j &&
          rooms[j].adults + rooms[j].children.length < max_occupant &&
          rooms[j].children.length < max_children
        ) {
          rooms[j].children.push(rooms[i].children.pop()!);
          break;
        }
      }
    }
  }

  // Step 5: Calculate costs and surcharges for each room
  let totalCostPerNight = 0;
  for (const room of rooms) {
    let roomCost = effectiveRoomPrice;
    let surcharges = 0;

    // Calculate total occupants in the room
    const totalOccupants = room.adults + room.children.length;

    // Check if total occupants exceed standard occupancy
    if (totalOccupants > standard_occupant) {
      // Calculate extra charges for children
      for (const child of room.children) {
        for (const [ageRange, rate] of Object.entries(surcharge_rates)) {
          const [minAge, maxAge] = ageRange.split("-").map(Number);
          if (child >= minAge && child <= maxAge) {
            const surcharge = effectiveRoomPrice * rate;
            roomCost += surcharge;
            surcharges += surcharge;
            break; // Stop checking age ranges after applying the surcharge
          }
        }
      }

      // Calculate extra charges for extra adults
      if (room.adults > standard_occupant) {
        const extraAdults = room.adults - standard_occupant;
        for (let i = 0; i < extraAdults; i++) {
          const surcharge = effectiveRoomPrice * surcharge_rates["18"]; // Assuming "18" as adult surcharge
          roomCost += surcharge;
          surcharges += surcharge;
        }
      }
    }

    room.cost = roomCost;
    room.surcharges = surcharges;
    totalCostPerNight += roomCost;
  }

  const total_room_price = totalCostPerNight * num_nights;
  const total_service_fee = Math.floor(total_room_price * (service_fee / 100));
  const total_tax = Math.floor(total_room_price * (tax / 100));
  const final_price = total_room_price + total_service_fee + total_tax;

  console.log("Room allocations:", rooms); // Log room allocations
  return {
    room_price_per_night: totalCostPerNight,
    total_room_price,
    total_service_fee,
    total_tax,
    final_price,
    base_price,
    room_discount,
    rooms,
  };
};

export default calculateCost;
