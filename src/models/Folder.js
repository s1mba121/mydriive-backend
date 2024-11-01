// src/models/Folder.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Folder = sequelize.define("Folder", {
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("photos", "videos", "documents", "others"), allowNull: false },
}, { timestamps: true });

module.exports = Folder;
