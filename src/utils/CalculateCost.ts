interface Room {
  adults: number;
  children: number[];
}

interface SurchargeRates {
  [ageRange: string]: number;
}

interface CustomerRequest {
  num_rooms: number;
  num_adults: number;
  num_children: number[];
}

interface HotelPolicy {
  room_price: number;
  room_discount: number;
  max_occupant: number;
  standard_occupant: number;
  max_children: number;
  surcharge_rates: SurchargeRates;
}

interface CalculationResult {
  totalCost: number;
  rooms: Room[];
}

const calculateCost = (
  customerRequest: CustomerRequest,
  hotelPolicy: HotelPolicy
): CalculationResult => {
  const { num_rooms, num_adults, num_children } = customerRequest;

  const {
    room_price,
    room_discount,
    max_occupant,
    standard_occupant,
    max_children,
    surcharge_rates,
  } = hotelPolicy;

  const sortedChildren = num_children.sort((a, b) => b - a); // Sort children by age descending
  const totalRooms = num_rooms;
  const effectiveRoomPrice = room_price - room_discount;

  let rooms: Room[] = Array(totalRooms)
    .fill({ adults: 0, children: [] })
    .map(() => ({ adults: 0, children: [] }));
  let adultsRemaining = num_adults;
  let childrenRemaining = [...sortedChildren];

  // Step 1: Allocate at least one adult to each room
  for (let i = 0; i < totalRooms; i++) {
    if (adultsRemaining > 0) {
      rooms[i].adults++;
      adultsRemaining--;
    }
  }

  // Step 2: Allocate remaining adults to rooms
  for (let i = 0; i < totalRooms; i++) {
    while (rooms[i].adults < standard_occupant && adultsRemaining > 0) {
      rooms[i].adults++;
      adultsRemaining--;
    }
  }

  // Step 3: Allocate children to rooms while minimizing surcharges
  for (let i = 0; i < totalRooms; i++) {
    while (
      rooms[i].children.length < max_children &&
      childrenRemaining.length > 0
    ) {
      rooms[i].children.push(childrenRemaining.shift()!);
    }
  }

  // Step 4: Further optimize room allocations to reduce surcharges
  for (let i = 0; i < totalRooms - 1; i++) {
    // If a room has more than the maximum allowed guests, try to move them to other rooms
    while (rooms[i].children.length > max_children) {
      for (let j = i + 1; j < totalRooms; j++) {
        if (rooms[j].children.length < max_children) {
          rooms[j].children.push(rooms[i].children.pop()!);
          break;
        }
      }
    }
  }

  // Step 5: Calculate the cost for each room
  let totalCost = 0;
  for (const room of rooms) {
    let roomCost = effectiveRoomPrice;

    // Calculate extra charges for children
    for (const child of room.children) {
      for (const [ageRange, rate] of Object.entries(surcharge_rates)) {
        const [minAge, maxAge] = ageRange.split("-").map(Number);
        if (child >= minAge && child <= maxAge) {
          roomCost += effectiveRoomPrice * rate;
        }
      }
    }

    totalCost += roomCost;
  }

  console.log("Room allocations:", rooms); // Log room allocations
  return { totalCost, rooms };
};

export default calculateCost;
