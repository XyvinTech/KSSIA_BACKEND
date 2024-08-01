const responseHandler = require("../helpers/responseHandler");
const Notification = require("../models/notifications");
const { emailNotificationSchema,inAppNotificationSchema } = require("../validation");
// const { sendEmail } = require("../helpers/email");
// const { sendInAppNotification } = require("../helpers/inAppNotification");
// const { sendEmail, sendInAppNotification } = require("../helpers/notification");

exports.saveEmail = async (req, res) => {

    const data = req.body;
    // console.log(`Received data parameter: ${data}`);                                 // Debug line

    // Validate the input data
    const { error } = emailNotificationSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Create a new product
    const newNotification = new Notification(data);
    await newNotification.save();

    // console.log(`Product added successfully!`);                                      // Debug line
    return responseHandler( res, 201, `Notification saved successfully!`, newNotification );

};

exports.saveInApp = async (req, res) => {

    const data = req.body;
    // console.log(`Received data parameter: ${data}`);                                 // Debug line

    // Validate the input data
    const { error } = inAppNotificationSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Create a new product
    const newNotification = new Notification(data);
    await newNotification.save();

    // console.log(`Product added successfully!`);                                      // Debug line
    return responseHandler( res, 201, `Notification saved successfully!`, newNotification );

};

exports.sendEmail = async (req, res) => {

    const { _id } = req.id;

    const email_body = await Notification.findOne(_id).populate({path: 'to', select: 'email'});
    
    if(!email_body){
        return responseHandler(res, 404, "Notification not found");
    }
    if(email_body.sent_status){
        return responseHandler(res, 400, "Notification already sent");
    }

    const to = email_body.to.email;
    const subject = email_body.subject;
    const body = email_body.content;
    const attachment = email_body.upload_url;
    const attachment2 = email_body.upload_file_url;
    const url = email_body.url;
        
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // or 'STARTTLS'
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: to,
        subject: subject,
        text: body + url,
        attachments: [
            {
                filename: path.basename(attachment), // Extract the file name from the file path
                path: attachment // Full file path
            },
            {
                filename: path.basename(attachment2), // Extract the file name from the file path
                path: attachment2 // Full file path
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return responseHandler(res, 500, 'Error sending email');
        }
        
        email_body.sent_status = true;
        email_body.sent_at = new Date();
        email_body.save((err) => {
            if (err) {
                return responseHandler(res, 500, 'Error updating email sent status');
            }
        });
        
        return responseHandler(res, 200, 'Email sent successfully');

    });

};

exports.getUnreadNotifications = async (req, res) => {
    const user_id = req.user_id;

    if(!user_id){
        return responseHandler(res, 401, 'Invalid request!');
    }

    const unreadNotifications = await Notification.find({ to: user_id,  type: true, read_status: false });
    if(!unreadNotifications){
        return responseHandler(res, 200, 'No unread notifications');
    }

    return responseHandler(res, 200, 'Notifications retrieved successfully', unreadNotifications);
};

exports.updateReadStatus = async (req, res) => {
    const id = req.id;

    if(!id){
        return responseHandler(res, 401, 'Invalid request!');
    }

    const noti = await Notification.findOne(id);
    if(!noti){
        return responseHandler(res, 404, 'Notification not found');
    }

    noti.read_status = true;
    noti.save((err) => {
        if (err) {
            return responseHandler(res, 500, 'Error updating notification read status');
        }
    });
};