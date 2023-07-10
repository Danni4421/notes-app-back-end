const Joi = require('joi');

const CollaborationsPayloadSchema = Joi.object({
  noteId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollaborationsPayloadSchema };
