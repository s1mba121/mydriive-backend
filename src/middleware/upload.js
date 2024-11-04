// src/middleware/upload.js
const multer = require("multer");
const path = require("path");

// Настройка хранилища
const storage = multer.memoryStorage();

// Проверка MIME-типа файла
const fileFilter = (req, file, cb) => {
    const fileTypes = /mp4|avi|mkv|mov/; // Поддерживаемые форматы видео
    const mimeType = file.mimetype.startsWith("video/");
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        cb(null, true);
    } else {
        cb(new Error("Загружать можно только видеофайлы"));
    }
};

// Настройка загрузки с фильтром
const upload = multer({
    storage,
    fileFilter,
});

// Экспортируем middleware для загрузки файлов
module.exports = upload.single("file"); // Ожидаем поле с именем 'file'
