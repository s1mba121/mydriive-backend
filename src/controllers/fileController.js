// src/controllers/fileController.js
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const File = require("../models/File");
const Folder = require("../models/Folder");

// Загрузка файла
exports.uploadFile = async (req, res) => {
    try {
        const { userId } = req.body;
        const { originalname, size, mimetype } = req.file;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const fileType = mimetype.startsWith("image") ? "photo" :
            mimetype.startsWith("video") ? "video" :
                ["application/pdf", "application/msword"].includes(mimetype) ? "document" : "other";

        const folder = await Folder.findOne({ where: { userId, type: fileType + "s" } });
        if (!folder) return res.status(400).json({ error: "Folder type not found" });

        if (user.usedStorage + size > user.storageLimit) {
            return res.status(400).json({ error: "Storage limit exceeded" });
        }

        const filePath = path.join(__dirname, "..", "storage", user.username, folder.name, originalname);
        fs.writeFileSync(filePath, req.file.buffer);

        const file = await File.create({
            userId,
            folderId: folder.id,
            name: originalname,
            path: filePath,
            size,
            type: fileType,
            uploadedAt: new Date(),
        });

        user.usedStorage += size;
        await user.save();

        res.status(200).json({ message: "File uploaded successfully", file });
    } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        res.status(500).json({ error: "File upload failed" });
    }
};

// Получение всех файлов для пользователя
exports.getAllFiles = async (req, res) => {
    try {
        const { userId } = req.params;
        const files = await File.findAll({ where: { userId, isDeleted: false } });
        res.status(200).json(files);
    } catch (error) {
        console.error("Error retrieving all files:", error);
        res.status(500).json({ error: "Failed to retrieve all files" });
    }
};

// Получение всех изображений или видео для пользователя
exports.getFilesByType = async (req, res) => {
    try {
        const { userId, type } = req.params;
        if (type !== "photos" && type !== "videos") {
            return res.status(400).json({ error: "Invalid type. Use 'photos' or 'videos'." });
        }

        const files = await File.findAll({
            where: {
                userId,
                isDeleted: false,
                type: type === "photos" ? "photo" : "video",
            },
        });

        res.status(200).json(files);
    } catch (error) {
        console.error(`Error retrieving ${type}:`, error);
        res.status(500).json({ error: `Failed to retrieve ${type}` });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findByPk(fileId);

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        // Проверяем, существует ли файл на диске
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ error: "File not found on server" });
        }

        res.download(file.path, file.name, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send file" });
            }
        });
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Failed to download file" });
    }
};

// Перемещение файла в корзину
exports.moveToTrash = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findByPk(fileId);

        if (!file || file.isDeleted) return res.status(404).json({ error: "File not found or already in trash" });

        file.isDeleted = true;
        file.deletedAt = new Date();
        await file.save();

        res.status(200).json({ message: "File moved to trash" });
    } catch (error) {
        console.error("Error moving file to trash:", error);
        res.status(500).json({ error: "Failed to move file to trash" });
    }
};

// Восстановление файла из корзины
exports.restoreFromTrash = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findByPk(fileId);

        if (!file || !file.isDeleted) return res.status(404).json({ error: "File not found in trash" });

        file.isDeleted = false;
        file.deletedAt = null;
        await file.save();

        res.status(200).json({ message: "File restored from trash" });
    } catch (error) {
        console.error("Error restoring file from trash:", error);
        res.status(500).json({ error: "Failed to restore file" });
    }
};

// Удаление файла из корзины окончательно
exports.deleteFilePermanently = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findByPk(fileId);

        if (!file || !file.isDeleted) return res.status(404).json({ error: "File not found in trash" });

        const user = await User.findByPk(file.userId);
        if (user) {
            user.usedStorage -= file.size;
            await user.save();
        }

        fs.unlinkSync(file.path);
        await file.destroy();

        res.status(200).json({ message: "File deleted permanently" });
    } catch (error) {
        console.error("Error permanently deleting file:", error);
        res.status(500).json({ error: "Failed to delete file permanently" });
    }
};

// Очистка всей корзины для пользователя
exports.emptyTrash = async (req, res) => {
    try {
        const { userId } = req.params;
        const files = await File.findAll({ where: { userId, isDeleted: true } });

        for (const file of files) {
            const user = await User.findByPk(file.userId);
            if (user) {
                user.usedStorage -= file.size;
                await user.save();
            }

            fs.unlinkSync(file.path);
            await file.destroy();
        }

        res.status(200).json({ message: "Trash emptied" });
    } catch (error) {
        console.error("Error emptying trash:", error);
        res.status(500).json({ error: "Failed to empty trash" });
    }
};

// Получение всех файлов в корзине для пользователя
exports.getTrashFiles = async (req, res) => {
    try {
        const { userId } = req.params;
        const files = await File.findAll({ where: { userId, isDeleted: true } });
        res.status(200).json(files);
    } catch (error) {
        console.error("Error retrieving trash files:", error);
        res.status(500).json({ error: "Failed to retrieve trash files" });
    }
};