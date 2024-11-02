// src/config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("cloud_storage", "root", "dfF93qZd", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

module.exports = sequelize;
