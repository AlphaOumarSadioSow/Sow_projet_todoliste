const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

//Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

//
// ─── AUTHENTIFICATION ────────────────────────────────────────────────────────────
//

// Enregistrement
exports.register = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email déjà utilisé.' });

    const newUser = await User.create({ nom, email, password, role });
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Utilisateur enregistré.',
      user: {
        id: newUser._id,
        nom: newUser.nom,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// 🔑 Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email ou mot de passe invalide.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Email ou mot de passe invalide.' });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Connexion réussie.',
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//
// ─── UTILISATEURS ET PRIVILÈGES ──────────────────────────────────────────────────
//

//  Voir un utilisateur + ses tâches (si autorisé)
exports.getUserWithTasks = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const tasks = await Task.find({ assignedTo: id });

    res.json({ user, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// 👥 Voir tous les utilisateurs (admin uniquement)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//  Tous les utilisateurs + leurs tâches (admin uniquement)
exports.getAllUsersWithTasks = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });
        return { user, tasks };
      })
    );

    res.json(usersWithTasks);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//  Supprimer un utilisateur (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await Task.deleteMany({ assignedTo: id }); // optionnel
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//  L'utilisateur supprime son propre compte
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Task.deleteMany({ assignedTo: userId }); // optionnel
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Votre compte a été supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};
