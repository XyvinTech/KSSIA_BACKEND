const cron = require("node-cron");
const moment = require("moment-timezone");
const User = require("../models/user");
const Payment = require("../models/payment");
const sendInAppNotification = require("../utils/sendInAppNotification");

// Cron job to check subscription statuses daily at midnight (Asia/Kolkata time zone)
cron.schedule("0 0 * * *", async () => {
    console.log("🚀 ~ Cron job started: Checking subscription statuses...");

    try {
        // Get the current DateTime in "Asia/Kolkata" timezone and for one month from now
        const now = moment().tz("Asia/Kolkata");
        const oneMonthFromNow = moment().tz("Asia/Kolkata").add(1, 'month');

        // Find all payments with statuses "accepted" or "expiring"
        const payments = await Payment.find({
            status: { $in: ["accepted", "expiring"] }
        }).populate('member'); // Populate the member field (user)

        for (const payment of payments) {
            const renewalDateTime = moment(payment.renewal).tz("Asia/Kolkata"); // Renewal DateTime in "Asia/Kolkata" timezone
            let updatedStatus = payment.status;

            // Check if the subscription is expiring within the next month
            if(payment.status == "accepted"){
                if (renewalDateTime.isBetween(now, oneMonthFromNow, null, '[]')) {
                    updatedStatus = "expiring";

                    if (payment.category === "membership") {
                        // Send an expiring notification for membership
                        const message = `Your membership subscription will expire on ${renewalDateTime.format('LLL')}. Please renew soon.`;
                        const title = "Membership Subscription Expiring Soon";
                        await sendInAppNotification([payment.member.fcm], title, message, null, "payments");
                    }

                    if (payment.category === "app") {
                        // Send an expiring notification for app subscription
                        const message = `Your app subscription will expire on ${renewalDateTime.format('LLL')}. Please renew soon.`;
                        const title = "App Subscription Expiring Soon";
                        await sendInAppNotification([payment.member.fcm], title, message, null, "payments");
                    }
                }
            }

            // Check if the subscription has already expired
            else if(payment.status == "expiring"){
                if (renewalDateTime.isBefore(now)) {
                    updatedStatus = "expired";

                    if (payment.category === "membership") {
                        // Send an expired notification for membership
                        const message = "Your membership subscription has expired. Please renew to continue using the app.";
                        const title = "Membership Subscription Expired";
                        await sendInAppNotification([payment.member.fcm], title, message, null, "payments");
                    }

                    if (payment.category === "app") {
                        // Send an expired notification for app subscription
                        const message = "Your app subscription has expired. Please renew to continue using the app.";
                        const title = "App Subscription Expired";
                        await sendInAppNotification([payment.member.fcm], title, message, null, "payments");
                    }
                }
            }
            
            // If the status has changed, update the payment and user's subscription field
            if (updatedStatus !== payment.status) {
                payment.status = updatedStatus;
                await payment.save();

                // Update the user's subscription field if category is app
                if (payment.category === "app" && updatedStatus === "expired") {
                    // Find if any new payments exist
                    const payments = await Payment.find({
                        member: payment.member._id,
                        status: "accepted",
                        category: "app"
                    });
                    if(!payments){
                        await User.findByIdAndUpdate(payment.member._id, { subscription: "free" });
                    }
                    else{
                        await User.findByIdAndUpdate(payment.member._id, { subscription: payments.subscription });
                    }
                }
                
            }
        }

        console.log("🚀 ~ Cron job completed: Subscription statuses checked.");
    } catch (error) {
        console.error("🚀 ~ Error in subscription cron job:", error.message);
    }
});
