const cron = require("node-cron");
const moment = require("moment-timezone");
const Promotion = require("../models/promotions");
require("dotenv").config();

cron.schedule("0 0 * * *", async () => {
  const now = moment().tz("Asia/Kolkata");

  try {
    const active = await Promotion.find({
      startDate: { $lte: now.toDate() },
      status: false,
    });

    for (const act of active) {
      act.status = true;
      await act.save();
    }
    console.log(`Activated ${active.length} promotions`);

    const expiring = await Promotion.find({
      endDate: { $lte: now.toDate() },
      status: true,
    });

    for (const exp of expiring) {
      exp.status = false;
      await exp.save();
    }
    console.log(`Deactivated ${expiring.length} promotions`);
  } catch (err) {
    console.error("Error updating promotions:", err);
  }
});
