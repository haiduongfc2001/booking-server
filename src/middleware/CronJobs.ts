// cronJobs.js
import cron from "node-cron";
import { Op } from "sequelize";
import { Booking } from "../model/Booking";
import { Promotion } from "../model/Promotion";
import { BOOKING_STATUS } from "../config/enum.config";
import { updateRoomStatus } from "../helper/updateStatuses";

// Set up the cron job
cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date();

    // Update expired bookings to CANCELED
    await Booking.update(
      { status: BOOKING_STATUS.CANCELED },
      {
        where: {
          status: BOOKING_STATUS.PENDING,
          expires_at: {
            [Op.lt]: now,
          },
        },
      }
    );

    // Activate promotions that should start
    await Promotion.update(
      { is_active: true },
      {
        where: {
          is_active: false,
          start_date: {
            [Op.lte]: now,
          },
          end_date: {
            [Op.gte]: now,
          },
        },
      }
    );

    // Deactivate promotions that should end
    await Promotion.update(
      { is_active: false },
      {
        where: {
          is_active: true,
          end_date: {
            [Op.lt]: now,
          },
        },
      }
    );

    console.log(
      "✅ Checked for expired bookings, promotions and updated status accordingly."
    );

    // Update room status
    await updateRoomStatus();
    console.log("✅ Updated room statuses.");
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
});
