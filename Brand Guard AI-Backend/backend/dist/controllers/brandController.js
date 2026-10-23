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
exports.getAllBrands = getAllBrands;
exports.getBrandById = getBrandById;
exports.updateBrand = updateBrand;
const brandService = __importStar(require("../services/brandService"));
async function getAllBrands(req, res) {
    try {
        const brands = await brandService.getAllBrands();
        const response = {
            success: true,
            data: brands
        };
        res.status(200).json(response);
    }
    catch (error) {
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve brands.'
            }
        };
        res.status(500).json(errorResponse);
    }
}
async function getBrandById(req, res) {
    try {
        const rawBrandId = req.params.brandId;
        const brandId = Array.isArray(rawBrandId) ? rawBrandId[0] : rawBrandId;
        if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Parameter brandId is required.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        const brand = await brandService.getBrandById(brandId.trim());
        if (!brand) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `Brand with ID '${brandId}' not found.`
                }
            };
            res.status(404).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            data: brand
        };
        res.status(200).json(response);
    }
    catch (error) {
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve brand profile.'
            }
        };
        res.status(500).json(errorResponse);
    }
}
async function updateBrand(req, res) {
    try {
        const rawBrandId = req.params.brandId;
        const brandId = Array.isArray(rawBrandId) ? rawBrandId[0] : rawBrandId;
        const body = req.body;
        if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Parameter brandId is required.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body must be a valid JSON object.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Optional field checks
        if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Brand name must be a non-empty string.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (body.tone !== undefined && !Array.isArray(body.tone)) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Brand tone must be an array of strings.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (body.guidelines !== undefined && (typeof body.guidelines !== 'object' || Array.isArray(body.guidelines))) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Guidelines must be an object containing brand rules.'
                }
            };
            res.status(400).json(errorResponse);
            return;
        }
        const updated = await brandService.updateBrand(brandId.trim(), body);
        if (!updated) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `Brand with ID '${brandId}' not found.`
                }
            };
            res.status(404).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            data: updated,
            message: 'Brand guidelines updated successfully.'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update brand profile.'
            }
        };
        res.status(500).json(errorResponse);
    }
}
