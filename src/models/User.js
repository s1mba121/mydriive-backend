// src/models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.ENUM("default", "premium"), defaultValue: "default" },
    storageLimit: { type: DataTypes.BIGINT, defaultValue: 5 * 1024 * 1024 * 1024 },
    usedStorage: { type: DataTypes.BIGINT, defaultValue: 0 },
    verificationCode: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
}, { timestamps: true });

module.exports = User;
