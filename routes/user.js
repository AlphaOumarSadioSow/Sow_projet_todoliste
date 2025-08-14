const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getUserWithTasks,
  getUsers,
  getAllUsersWithTasks,
  deleteUser,
  deleteMyAccount,
} = require('../controllers/authController');

const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../outilles/validator'); // attention au dossier "outilles"
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authRole');

// Inscription & connexion (validation Joi appliquée)
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Routes protégées (JWT)
router.get('/', protect, isAdmin, getUsers);                 // Tous les utilisateurs (admin)
router.get('/all-tasks', protect, isAdmin, getAllUsersWithTasks); // Tous les utilisateurs + tâches (admin)
router.get('/:id', protect, getUserWithTasks);                // Voir un utilisateur + tâches (user/admin)
router.delete('/:id', protect, isAdmin, deleteUser);          // Supprimer un utilisateur (admin)
router.delete('/me/delete', protect, deleteMyAccount);        // Supprimer son compte (user)

// Export du routeur
module.exports = router;
