const Joi = require("joi");

// User arrays Schema validation

const phoneSchema = Joi.object({
    personal: Joi.number().required(),
    landline: Joi.number(),
    company_phone_number: Joi.number(),
    whatsapp_number: Joi.number(),
    whatsapp_business_number: Joi.number()
});

const schemaUrl = Joi.object({
    platform: Joi.string(),
    url: Joi.string().uri()
});

const otherSchema = Joi.object({
    name: Joi.string(),
    url: Joi.string().uri(),
    authority_name : Joi.string()
});

const productsSchema = Joi.object({
    seller_id: Joi.string().required(),
    _id: Joi.string(),
    name: Joi.string().required(),
    image: Joi.string().uri(),
    price: Joi.number().min(0).required(),
    offer_price: Joi.number().min(0),
    description: Joi.string(),
    date: Joi.date(),
    units: Joi.number().min(0),
    moq: Joi.number().min(0),
    status: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string())
});

// Create a new user function validation

exports.CreateUserSchema = Joi.object({
    name: Joi.object({
        first_name: Joi.string().required(),
        middle_name: Joi.string().optional(),
        last_name: Joi.string().required()
    }).required(),
    membership_id: Joi.string().required(),
    blood_group: Joi.string(),
    email: Joi.string().email().required(),
    profile_picture: Joi.string().uri(),
    bio: Joi.string(),
    phone_numbers: phoneSchema.required(),
    designation: Joi.string(),
    company_name: Joi.string(),
    company_email: Joi.string().email(),
    company_address: Joi.string(),
    company_logo: Joi.string().uri(),
    business_category: Joi.string(),
    sub_category: Joi.string(),
    address: Joi.string(),
    websites: Joi.array().items(otherSchema),
    status: Joi.string(),
    is_active: Joi.boolean().default(true),
    is_deleted: Joi.boolean().default(false)
});

// Edit user function validation

exports.EditUserSchema = Joi.object({
    name: Joi.object({
        first_name: Joi.string().required(),
        middle_name: Joi.string().optional(),
        last_name: Joi.string().required()
    }).required(),
    blood_group: Joi.string(),
    email: Joi.string().email().required(),
    profile_picture: Joi.string().uri(),
    phone_numbers: phoneSchema.required(),
    designation: Joi.string(),
    company_name: Joi.string(),
    company_email: Joi.string().email(),
    company_address: Joi.string(),
    company_logo: Joi.string().uri(),
    business_category: Joi.string(),
    sub_category: Joi.string(),
    // business_category: Joi.string(),
    // sub_category: Joi.string(),
    bio: Joi.string(),
    address: Joi.string(),
    social_media: Joi.array().items(schemaUrl),
    websites: Joi.array().items(otherSchema),
    video: Joi.array().items(otherSchema),
    awards: Joi.array().items(otherSchema),
    certificates: Joi.array().items(otherSchema),
    brochure: Joi.array().items(otherSchema),
    products: Joi.array().items(productsSchema),
    status: Joi.string(),
    is_active: Joi.boolean().default(true),
    is_deleted: Joi.boolean().default(false),
    selectedTheme: Joi.string()
});

exports.productsSchemaval = productsSchema;

// events array validation
const speakerSchema = Joi.object({
    speaker_name: Joi.string().required(),
    speaker_designation: Joi.string().required(),
    speaker_image: Joi.string().uri(),
    speaker_role: Joi.string().required()
});

exports.EditEventsSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    image: Joi.string().uri(),
    description: Joi.string(),
    date: Joi.date(),
    time: Joi.date(),
    platform: Joi.string(),
    meeting_link: Joi.string(),
    organiser_name: Joi.string().required(),
    organiser_company_name: Joi.string().required(),
    guest_image: Joi.string().uri(),
    organiser_role: Joi.string().required(),
    speakers: Joi.array().items(speakerSchema),
    activate: Joi.boolean()
});

// notificationSchema validation

exports.emailNotificationSchema = Joi.object({
    to: Joi.array().items(Joi.string()).required(),
    subject: Joi.string().min(1).max(255).required(),
    content: Joi.string(),
    media_url: Joi.string().uri().allow(''),
    file_url: Joi.string().uri().allow(''),
    link_url: Joi.string().uri().allow(''),
});

exports.inAppNotificationSchema = Joi.object({
    to: Joi.array().items(Joi.string()).required(),
    subject: Joi.string().min(1).max(255).required(),
    content: Joi.string(),
    media_url: Joi.string().uri().allow(''),
    link_url: Joi.string().uri().allow(''),
    file_url: Joi.string().uri().allow(''),
    readBy: Joi.array().items(Joi.string().hex().length(24)).default([])
});

exports.NewsSchema = Joi.object({
    category: Joi.string().required(),
    title: Joi.string().required(),
    content: Joi.string().optional(),
});

exports.EditPromotionSchema = Joi.object({
    type: Joi.string().valid('banner', 'video', 'poster', 'notice').required(),
    banner_image_url: Joi.string(),
    upload_video: Joi.string(),
    yt_link: Joi.string().when('type', { is: 'video', then: Joi.required() }),
    video_title: Joi.string().when('type', { is: 'video', then: Joi.required() }),
    poster_image_url: Joi.string(),
    notice_title: Joi.string().when('type', { is: 'notice', then: Joi.required() }),
    notice_description: Joi.string().when('type', { is: 'notice', then: Joi.required() }),
    notice_link: Joi.string().when('type', { is: 'notice', then: Joi.required() }),
    status: Joi.boolean().default(false),
    startDate: Joi.date(),
    endDate: Joi.date()
});

exports.PaymentSchema = Joi.object({
    member: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    time: Joi.date().required(),
    amount: Joi.number().positive().required(),
    mode_of_payment: Joi.string().required(),
    category: Joi.string().required(),
    status: Joi.string().valid('pending', 'accepted', 'resubmit', 'rejected').default('pending'),
    invoice_url: Joi.string().uri().allow(''),
    remarks: Joi.string().allow(''),
});

exports.ReviewSchema = Joi.object({
    reviewer: Joi.string().hex().length(24).required(),
    content: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
});