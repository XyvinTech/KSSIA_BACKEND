const cron = require("node-cron");
const moment = require("moment-timezone");
const Event = require("../models/eventModel");
require("dotenv").config();

// Define the cron job to run every minute
cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Kolkata");
  const currentDateTime = moment.utc(now.format("YYYY-MM-DDTHH:mm")).toDate();

  try {
    // Update events from "upcoming" or "postponded" to "live"
    const liveEvents = await Event.updateMany(
      {
        status: { $in: ["upcoming", "postponded"] },
        startDate: { $lte: now.toDate() },
        startTime: { $lte: currentDateTime },
      },
      { status: "live" },
      { new: true }
    );
    console.log(`Updated ${liveEvents.modifiedCount} events to live`);

    // Update events from "live" to "completed"
    const completedEvents = await Event.updateMany(
      {
        status: "live",
        endDate: { $lte: now.toDate() },
        endTime: { $lte: currentDateTime },
      },
      { status: "completed" },
      { new: true }
    );
    console.log(`Updated ${completedEvents.modifiedCount} events to completed`);
  } catch (err) {
    console.error("Error updating events:", err);
  }
});