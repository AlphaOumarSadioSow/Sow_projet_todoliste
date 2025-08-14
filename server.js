require("dotenv").config(); // Charger les variables d'environnement
const express = require('express');
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
const userRoutes = require('./routes/user');   // adapte le chemin si besoin
const taskRoutes = require('./routes/task');
const connectDB = require('./config/db');
connectDB()

// Monter les routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Gestion des erreurs 404 (route non trouvée)
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port http://localhost:${PORT}`);
});
