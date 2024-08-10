const Joi = require("joi");
const CreateRolesSchema = Joi.object({
    role_name: Joi.string().required(),
    permissions: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            value: Joi.boolean().required(),
        })
    ).required(),
    description: Joi.string().optional(),
});
module.exports = CreateRolesSchema;
