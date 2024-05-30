import { Op } from "sequelize";
import { DISCOUNT_TYPE } from "../config/enum.config";
import { Promotion } from "../model/Promotion";

interface RoomType {
  id: number;
  base_price: number;
}

// Function to calculate room discount
async function calculateRoomDiscount(roomType: RoomType): Promise<number> {
  const now = new Date();

  // Fetch the active promotion for the room type
  const promotion = await Promotion.findOne({
    where: {
      room_type_id: roomType.id,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
    },
  });

  let room_discount: number;
  if (promotion) {
    if (promotion.discount_type === DISCOUNT_TYPE.FIXED_AMOUNT) {
      room_discount = promotion.discount_value;
    } else if (promotion.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
      room_discount = roomType.base_price * (promotion.discount_value / 100);
    } else {
      room_discount = 0;
    }
  } else {
    room_discount = 0;
  }

  return room_discount;
}

// Export the function to use in other parts of your application
export { calculateRoomDiscount };
