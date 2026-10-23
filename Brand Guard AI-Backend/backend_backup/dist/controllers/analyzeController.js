"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContent = analyzeContent;
const brandService = __importStar(require("../services/brandService"));
const analysisService = __importStar(require("../services/analysisService"));
async function analyzeContent(req, res) {
    try {
        const { brandId, content } = req.body || {};
        // Validate presence and type of brandId
        if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Field "brandId" is required and must be a non-empty string.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Validate presence and type of content
        if (content === undefined || content === null || typeof content !== 'string') {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Field "content" is required and must be a string.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (!content.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Field "content" must not be empty.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Retrieve brand profile
        const brand = await brandService.getBrandById(brandId.trim());
        if (!brand) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `Brand with ID "${brandId}" was not found.`
                }
            };
            res.status(404).json(errorResponse);
            return;
        }
        // Call separate analysis service
        const result = await analysisService.analyzeContent(content, brand);
        // Return exact API contract response
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error during content analysis:', error);
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred while analyzing content.'
            }
        };
        res.status(500).json(errorResponse);
    }
}
