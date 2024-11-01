// src/models/associations.js
const User = require("./User");
const Folder = require("./Folder");
const File = require("./File");

// Определение ассоциаций
User.hasMany(Folder, { foreignKey: "userId", as: "folders" });
Folder.belongsTo(User, { foreignKey: "userId" });

Folder.hasMany(File, { foreignKey: "folderId", as: "files" }); // Добавляем эту строку
File.belongsTo(Folder, { foreignKey: "folderId" }); // Убедитесь, что эта строка есть
File.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Folder, File };
