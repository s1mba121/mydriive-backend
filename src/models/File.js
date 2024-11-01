// src/models/File.js
const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Folder = require("./Folder");

const File = sequelize.define("File", {
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    folderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Folder, key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.BIGINT, allowNull: false },
    type: { type: DataTypes.ENUM("photo", "video", "document", "other"), allowNull: false },
    uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },  // Флаг для корзины
    deletedAt: { type: DataTypes.DATE, allowNull: true }           // Дата перемещения в корзину
}, { timestamps: true });

module.exports = File;
