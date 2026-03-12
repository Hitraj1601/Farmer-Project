const express = require("express");
const router = express.Router();
const cropController = require("../controllers/crop.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../config/multer");
const validate = require("../middleware/validate.middleware");
const { createCropSchema, updateCropSchema } = require("../middleware/validate.schemas");

router.post("/", authenticate, authorize("FARMER"), upload.single("image"), validate(createCropSchema), cropController.createCrop);
router.get("/", cropController.getAllCrops);
router.get("/my", authenticate, authorize("FARMER"), cropController.getMyCrops);
router.get("/:id", cropController.getCropById);
router.put("/:id", authenticate, authorize("FARMER"), upload.single("image"), validate(updateCropSchema), cropController.updateCrop);
router.delete("/:id", authenticate, authorize("FARMER"), cropController.deleteCrop);

module.exports = router;
