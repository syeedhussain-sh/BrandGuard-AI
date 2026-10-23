"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRoutes_1 = __importDefault(require("./healthRoutes"));
const brandRoutes_1 = __importDefault(require("./brandRoutes"));
const analyzeRoutes_1 = __importDefault(require("./analyzeRoutes"));
const router = (0, express_1.Router)();
router.use('/health', healthRoutes_1.default);
router.use('/brands', brandRoutes_1.default);
router.use('/analyze', analyzeRoutes_1.default);
exports.default = router;
