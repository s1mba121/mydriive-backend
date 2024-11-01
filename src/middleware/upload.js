// src/middleware/upload.js
const multer = require("multer");
const path = require("path");

// Настройка хранилища
const storage = multer.memoryStorage(); // Используем память для временного хранения файла
const upload = multer({ storage });

// Экспортируем middleware для загрузки файлов
module.exports = upload.single("file"); // Ожидаем поле с именем 'file'
