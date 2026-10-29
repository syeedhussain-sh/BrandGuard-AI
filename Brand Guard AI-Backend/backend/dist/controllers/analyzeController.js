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
const reviewService = __importStar(require("../services/reviewService"));
/**
 * POST /api/analyze
 *
 * Supports two analysis modes:
 * Mode A: Configured Brand Analysis (if matching profile exists for brandId or companyName)
 * Mode B: Universal Generic Brand Analysis (for ANY company or unconfigured brand across ANY industry)
 */
async function analyzeContent(req, res) {
    try {
        const { brandId, companyName, brandName, industry, content } = req.body || {};
        const rawCompany = typeof companyName === 'string'
            ? companyName.trim()
            : (typeof brandName === 'string' ? brandName.trim() : '');
        const rawBrandId = typeof brandId === 'string' ? brandId.trim() : '';
        const rawIndustry = typeof industry === 'string' ? industry.trim() : '';
        // Validate presence of brand or company identifier
        if (!rawCompany && !rawBrandId) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Field "companyName" or "brandId" is required and must be a non-empty string.'
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
        let brandProfile = null;
        // Check if brandId matches a configured brand profile
        if (rawBrandId) {
            brandProfile = await brandService.getBrandById(rawBrandId);
        }
        // If not found by brandId, check if company name matches any configured brand name
        if (!brandProfile && rawCompany) {
            brandProfile = await brandService.getBrandByName(rawCompany);
        }
        // =========================================================================
        // Mode A: Configured Brand Analysis
        // =========================================================================
        if (brandProfile) {
            const result = await analysisService.analyzeContent(content, brandProfile, {
                companyName: rawCompany || brandProfile.name,
                industry: rawIndustry || brandProfile.description,
                isGeneric: false,
            });
            if (result.requiresHumanReview || (result.summary && result.summary.high > 0)) {
                reviewService.createOrUpdateReview({
                    analysisId: result.analysisId,
                    brandId: brandProfile.id,
                    brandName: brandProfile.name,
                    companyName: rawCompany || brandProfile.name,
                    industry: rawIndustry,
                    contentSnippet: content.slice(0, 160),
                    status: 'pending',
                }).catch((err) => console.error('Failed to register pending review:', err));
            }
            res.status(200).json(result);
            return;
        }
        // =========================================================================
        // If client specifically queried a legacy brandId lookup without companyName
        // and no brand profile was found, return 404 NOT_FOUND.
        // =========================================================================
        if (rawBrandId && !rawCompany) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `Brand with ID "${rawBrandId}" was not found.`
                }
            };
            res.status(404).json(errorResponse);
            return;
        }
        // =========================================================================
        // Mode B: Universal Generic Brand Analysis
        // Automatically invoked for any user-entered company from any industry
        // without official configured brand guidelines.
        // =========================================================================
        const genericBrand = {
            id: rawBrandId || rawCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: rawCompany,
            companyName: rawCompany,
            industry: rawIndustry,
            isGeneric: true,
            guidelines: {}
        };
        const result = await analysisService.analyzeContent(content, genericBrand, {
            companyName: rawCompany,
            industry: rawIndustry,
            isGeneric: true,
            mode: 'generic'
        });
        if (result.requiresHumanReview || (result.summary && result.summary.high > 0)) {
            reviewService.createOrUpdateReview({
                analysisId: result.analysisId,
                brandId: genericBrand.id,
                brandName: rawCompany,
                companyName: rawCompany,
                industry: rawIndustry,
                contentSnippet: content.slice(0, 160),
                status: 'pending',
            }).catch((err) => console.error('Failed to register pending review:', err));
        }
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
