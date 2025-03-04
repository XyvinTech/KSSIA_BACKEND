const cron = require("node-cron");
const moment = require("moment-timezone");
const sendInAppNotification = require("../utils/sendInAppNotification");
const Payment = require("../models/payment");
const User = require("../models/user");
require("dotenv").config();

cron.schedule("0 0 * * *", async () => {
  const now = moment().tz("Asia/Kolkata");

  try {
    const tenDaysFromNow = now.clone().add(10, "days").toDate();

    const expiring = await Payment.find({
      category: "app",
      status: { $in: ["active", "expiring"] },
    })
      .populate("user")
      .populate("parentSub");

    for (const exp of expiring) {
      if (exp.parentSub && exp.parentSub.expiryDate <= tenDaysFromNow) {
        exp.status = "expiring";
        await exp.save();

        await sendInAppNotification(
          [exp.user.fcmToken],
          "Subscription Expiring",
          "Your subscription to our app is expiring soon. Please renew your subscription to continue using our app."
        );
      }
    }

    const expiredSub = await Payment.find({
      category: "app",
      status: "expiring",
    })
      .populate("user")
      .populate("parentSub");

    for (const exp of expiredSub) {
      if (exp.parentSub && exp.parentSub.expiryDate <= now.toDate()) {
        exp.status = "expired";
        await exp.save();
        await User.findByIdAndUpdate(exp.user._id, { subscription: "free" });

        await sendInAppNotification(
          [exp.user.fcmToken],
          "Subscription Expired",
          "Your subscription to our app has expired. Please renew your subscription to continue using our app."
        );
      }
    }
  } catch (err) {
    console.error("Error updating subscriptions:", err);
  }
});
