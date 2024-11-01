// src/controllers/userController.js
const User = require("../models/User");
const File = require("../models/File");
const Folder = require("../models/Folder");

exports.getUserData = async (req, res) => {
    try {
        const { userId } = req.params;

        // Получение данных пользователя
        const user = await User.findByPk(userId, {
            attributes: ["username", "email", "phone", "role", "storageLimit", "usedStorage"],
            include: [
                {
                    model: Folder,
                    as: "folders", // Используйте правильный алиас
                    include: {
                        model: File,
                        as: "files", // Убедитесь, что здесь правильный алиас
                        attributes: ["name", "size", "type", "uploadedAt", "isDeleted"]
                    }
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        res.status(500).json({ error: "Failed to retrieve user data" });
    }
};

