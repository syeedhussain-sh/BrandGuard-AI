"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brandController_1 = require("../controllers/brandController");
const router = (0, express_1.Router)();
// GET /api/brands - List all brands
router.get('/', brandController_1.getAllBrands);
// GET /api/brands/:brandId - Get specific brand guidelines
router.get('/:brandId', brandController_1.getBrandById);
// PUT /api/brands/:brandId - Update brand guidelines
router.put('/:brandId', brandController_1.updateBrand);
exports.default = router;
