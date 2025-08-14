const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const validate = require('../middlewares/validate');
const { taskCreateSchema, taskUpdateSchema } = require('../outilles/validator');
const { protect } = require('../middlewares/authMiddleware');

// Créer une tâche (auth + validation)
router.post('/ajouter', protect, validate(taskCreateSchema), createTask);

// Récupérer toutes les tâches (auth)
router.get('/affichertout', protect, getTasks);

// Récupérer tâche par ID (auth)
router.get('/:id', protect, getTaskById);

// Modifier une tâche (auth + validation)
router.put('/:id', protect, validate(taskUpdateSchema), updateTask);

// Supprimer une tâche (auth)
router.delete('/:id', protect, deleteTask);

module.exports = router;
