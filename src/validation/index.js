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

const productsSchema = Joi.object({
    seller_id: Joi.string().required(),
    name: Joi.string().required(),
    image: Joi.string().uri(),
    price: Joi.number().min(0).required(),
    offer_price: Joi.number().min(0),
    description: Joi.string(),
    date: Joi.date(),
    units: Joi.number().min(0),
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
    phone_numbers: phoneSchema.required(),
    designation: Joi.string(),
    company_name: Joi.string(),
    company_email: Joi.string().email(),
    business_category: Joi.string(),
    sub_category: Joi.string(),
    address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zip: Joi.string()
    }),
    websites: Joi.array().items(websiteSchema),
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
    // business_category: Joi.string(),
    // sub_category: Joi.string(),
    bio: Joi.string(),
    address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zip: Joi.string()
    }),
    social_media: Joi.array().items(socialMediaSchema),
    websites: Joi.array().items(websiteSchema),
    video: Joi.array().items(videoSchema),
    awards: Joi.array().items(awardSchema),
    certificates: Joi.array().items(certificateSchema),
    brochure: Joi.array().items(brochureSchema),
    products: Joi.array().items(productsSchema)
});