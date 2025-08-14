const Task = require('../models/Task');

// Créer une tâche
exports.createTask = async (req, res) => {
  try {
    const { titre, description, priorite, status, assignedTo } = req.body;

    const task = await Task.create({
      titre,
      description,
      priorite,
      status,
      assignedTo,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Tâche créée.', task });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// Obtenir toutes les tâches (avec filtres + pagination)
exports.getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 5, priorite, status } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (priority) filters.priority = priority;
    if (status) filters.status = status;

    // Si non admin, ne voir que ses propres tâches
    if (req.user.role !== 'admin') {
      filters.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filters)
      .populate('assignedTo', 'name email')
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(filters);

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// 🔍 Récupérer une tâche par ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée.' });

    if (
      req.user.role !== 'admin' &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Accès interdit.' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// ✏️ Modifier une tâche
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: 'Tâche non trouvée.' });

    const isOwner = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    Object.assign(task, req.body); // Met à jour les champs reçus
    await task.save();

    res.json({ message: 'Tâche mise à jour.', task });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: 'Tâche non trouvée.' });

    const isOwner = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await task.deleteOne();

    res.json({ message: 'Tâche supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};
