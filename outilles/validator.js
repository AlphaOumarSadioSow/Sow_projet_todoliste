const Joi = require('joi');

//
// ─── VALIDATION UTILISATEUR ──────────────────────────────────────────────
//

const registerSchema = Joi.object({
  nom: Joi.string().min(3).max(100).required().messages({
    'any.required': 'Le nom est requis.',
    'string.min': 'Le nom doit contenir au moins 3 caractères.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide.',
    'any.required': 'L’email est requis.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères.',
    'any.required': 'Le mot de passe est requis.'
  }),
  role: Joi.string().valid('membre', 'admin').default('membre')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

//
// ─── VALIDATION TÂCHES ───────────────────────────────────────────────────
//

const taskCreateSchema = Joi.object({
  titre: Joi.string().min(3).max(100).required().messages({
    'any.required': 'Le titre est requis.',
    'string.min': 'Le titre doit avoir au moins 3 caractères.'
  }),
  description: Joi.string().max(1000).allow(''),
  priorite: Joi.string().valid('basse', 'moyenne', 'haute').default('moyenne'),
  status: Joi.string().valid('encours', 'terminée').default('encours'),
  assignedTo: Joi.string().hex().length(24).required().messages({
    'any.required': 'Un utilisateur assigné est requis.',
    'string.length': 'ID utilisateur invalide.'
  })
});

const taskUpdateSchema = Joi.object({
  titre: Joi.string().min(3).max(100),
  description: Joi.string().max(1000).allow(''),
  priorite: Joi.string().valid('basse', 'moyenne', 'haute'),
  status: Joi.string().valid('encours', 'terminée'),
  assignedTo: Joi.string().hex().length(24)
});

//
// ─── EXPORTS ─────────────────────────────────────────────────────────────
//

module.exports = {
  registerSchema,
  loginSchema,
  taskCreateSchema,
  taskUpdateSchema
};
