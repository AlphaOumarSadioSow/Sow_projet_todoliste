const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log("MongoDB connecté ");
  } catch (error) {
    console.error("Erreur de connexion MongoDB");
    process.exit(1); // Arrête le serveur si la connexion échoue
  }
};

module.exports = connectDB;
