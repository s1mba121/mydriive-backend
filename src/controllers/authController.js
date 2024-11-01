// src/controllers/authController.js
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Folder = require("../models/Folder");
const config = require("../config/config");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Настройки транспорта для почты
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

// Генерация кода верификации
const generateVerificationCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array(6).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
};

// Регистрация
exports.register = async (req, res) => {
    try {
        console.log("Регистрация пользователя: ", req.body);
        const { username, email, password, phone } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.warn("Пользователь с таким email уже существует: ", email);
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        console.log("Сгенерирован код верификации: ", verificationCode);

        const user = await User.create({
            username,
            email,
            phone,
            password: hashedPassword,
            role: "default",
            storageLimit: 5 * 1024 * 1024 * 1024,
            usedStorage: 0,
            isVerified: false,
            verificationCode
        });

        const baseDir = path.join(__dirname, "..", "storage", user.username);
        fs.mkdirSync(baseDir, { recursive: true });

        const folderTypes = ["photos", "videos", "documents", "others"];
        for (const type of folderTypes) {
            const folderPath = path.join(baseDir, type);
            fs.mkdirSync(folderPath, { recursive: true });
            await Folder.create({ userId: user.id, name: type, type });
        }

        await transporter.sendMail({
            to: email,
            subject: "Verify your email",
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        });
        console.log("Письмо с кодом верификации отправлено на: ", email);

        res.status(201).json({ message: "Registration successful. Check your email for verification." });
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

// Верификация email
exports.verifyEmail = async (req, res) => {
    try {
        console.log("Верификация email: ", req.body);
        const { email, code } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.warn("Пользователь не найден: ", email);
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (user.verificationCode !== code) {
            console.warn("Неверный код верификации для пользователя: ", email);
            return res.status(400).json({ error: "Invalid verification code" });
        }

        await user.update({ isVerified: true, verificationCode: null });
        console.log("Email успешно верифицирован для: ", email);
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Ошибка верификации:", error);
        res.status(500).json({ error: "Verification failed" });
    }
};

// Логин
exports.login = async (req, res) => {
    try {
        console.log("Попытка входа пользователя: ", req.body);
        const { email, password } = req.body;

        // Проверяем, есть ли пользователь по email или username
        const user = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username: email }] // используем оператор OR
            }
        });

        if (!user) {
            console.warn("Пользователь не найден: ", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!user.isVerified) {
            console.warn("Пользователь не верифицирован: ", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn("Неверный пароль для пользователя: ", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("Пользователь успешно вошел: ", email);
        res.json({ token, userId: user.id });
    } catch (error) {
        console.error("Ошибка входа:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
