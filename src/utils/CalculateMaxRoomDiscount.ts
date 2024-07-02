import { DISCOUNT_TYPE } from "../config/enum.config";
import { Promotion } from "../model/Promotion";
import { RoomType } from "../model/RoomType";

export async function calculateMaxRoomDiscount(roomTypes: RoomType[]) {
  let maxDiscount = 0;

  for (const roomType of roomTypes) {
    const promotions = await Promotion.findAll({
      where: {
        room_type_id: roomType.id,
        is_active: true,
      },
    });

    for (const promotion of promotions) {
      let discountValue = promotion.discount_value;

      if (promotion.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
        discountValue = (roomType.base_price * discountValue) / 100;
      }

      if (discountValue > maxDiscount) {
        maxDiscount = discountValue;
      }
    }
  }

  return maxDiscount;
}
