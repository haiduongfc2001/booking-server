interface Room {
  adults: number;
  children: number[];
}

interface SurchargeRates {
  [ageRange: string]: number;
}

interface CustomerRequest {
  numRooms: number;
  numAdults: number;
  numChildren: number[];
}

interface HotelPolicy {
  roomPrice: number;
  roomDiscount: number;
  maxOccupancy: number;
  adultOccupancy: number;
  childOccupancy: number;
  surchargeRates: SurchargeRates;
}

interface CalculationResult {
  totalCost: number;
  rooms: Room[];
}

const calculateCost = (
  customerRequest: CustomerRequest,
  hotelPolicy: HotelPolicy
): CalculationResult => {
  const { numRooms, numAdults, numChildren } = customerRequest;

  const {
    roomPrice,
    roomDiscount,
    maxOccupancy,
    adultOccupancy,
    childOccupancy,
    surchargeRates,
  } = hotelPolicy;

  const sortedChildren = numChildren.sort((a, b) => b - a); // Sort children by age descending
  const totalRooms = numRooms;
  const effectiveRoomPrice = roomPrice - roomDiscount;

  let rooms: Room[] = Array(totalRooms)
    .fill({ adults: 0, children: [] })
    .map(() => ({ adults: 0, children: [] }));
  let adultsRemaining = numAdults;
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
    while (rooms[i].adults < adultOccupancy && adultsRemaining > 0) {
      rooms[i].adults++;
      adultsRemaining--;
    }
  }

  // Step 3: Allocate children to rooms while minimizing surcharges
  for (let i = 0; i < totalRooms; i++) {
    while (
      rooms[i].children.length < childOccupancy &&
      childrenRemaining.length > 0
    ) {
      rooms[i].children.push(childrenRemaining.shift()!);
    }
  }

  // Step 4: Further optimize room allocations to reduce surcharges
  for (let i = 0; i < totalRooms - 1; i++) {
    // If a room has more than the maximum allowed guests, try to move them to other rooms
    while (rooms[i].children.length > childOccupancy) {
      for (let j = i + 1; j < totalRooms; j++) {
        if (rooms[j].children.length < childOccupancy) {
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
      for (const [ageRange, rate] of Object.entries(surchargeRates)) {
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
