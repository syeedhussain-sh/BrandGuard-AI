"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyzeController_1 = require("../controllers/analyzeController");
const router = (0, express_1.Router)();
// POST /api/analyze - Run brand compliance analysis
router.post('/', analyzeController_1.analyzeContent);
exports.default = router;
