// server.js
const express = require("express");
const cron = require("node-cron");
const os = require("os");
const fs = require("fs");
const cors = require("cors");
const { Op } = require("sequelize");

const authRoutes = require("./src/routes/authRoutes");
const fileRoutes = require("./src/routes/fileRoutes");
const userRoutes = require("./src/routes/userRoutes");
const sequelize = require("./src/config/database");
const { User, Folder, File } = require("./src/models/associations");
const errorMiddleware = require("./src/middleware/authMiddleware");

const app = express();
const PORT = 3000; // Укажите нужный порт

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/files", errorMiddleware, fileRoutes); // Применение middleware только к маршрутам файлов
app.use("/user", userRoutes);

// Синхронизация с базой данных и запуск сервера
sequelize.sync().then(() => {
    const interfaces = os.networkInterfaces();
    let serverIP = "localhost";
    
    // Находим первый внешний IPv4-адрес
    for (const interfaceName of Object.keys(interfaces)) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === "IPv4" && !iface.internal) {
                serverIP = iface.address;
                break;
            }
        }
        if (serverIP !== "localhost") break;
    }
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://${serverIP}:${PORT}`);
    });
});

// Автоматическая очистка корзины каждую неделю
cron.schedule("0 0 * * 0", async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const filesToDelete = await File.findAll({
            where: {
                isDeleted: true,
                deletedAt: { [Op.lt]: oneWeekAgo },
            },
        });

        for (const file of filesToDelete) {
            const user = await User.findByPk(file.userId);
            if (user) {
                user.usedStorage -= file.size;
                await user.save();
            }

            fs.unlinkSync(file.path);
            await file.destroy();
        }

        console.log("Trash cleaned up successfully.");
    } catch (error) {
        console.error("Error cleaning up trash:", error);
    }
});
