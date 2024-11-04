// src/routes/fileRoutes.js
const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/upload", authMiddleware, upload, fileController.uploadFile);
router.get("/files/:userId", fileController.getAllFiles);
router.get("/files/:userId/:type", fileController.getFilesByType);
router.get("/download/:fileId", authMiddleware, fileController.downloadFile);
router.post("/:fileId/moveToTrash", authMiddleware, fileController.moveToTrash);
router.post("/:fileId/restoreFromTrash", authMiddleware, fileController.restoreFromTrash);
router.delete("/:fileId/deletePermanently", authMiddleware, fileController.deleteFilePermanently);
// router.deVideolete("/trash/:userId/empty", authMiddleware, fileController.emptyTrash);
router.get("/trash/:userId", authMiddleware, fileController.getTrashFiles);

module.exports = router;
