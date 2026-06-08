const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { bulkUploadCrops } = require("../controllers/bulkCrop.controller");

// Use memory storage so we never write CSV/XLSX files to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV or Excel files are allowed."), false);
    }
  },
});

router.post(
  "/",
  authenticate,
  authorize("FARMER"),
  upload.single("file"),
  bulkUploadCrops
);

module.exports = router;
