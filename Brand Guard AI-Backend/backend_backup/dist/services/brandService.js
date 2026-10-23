"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBrands = getAllBrands;
exports.getBrandById = getBrandById;
exports.updateBrand = updateBrand;
exports.createBrand = createBrand;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const DATA_FILE_PATH = path_1.default.resolve(__dirname, '../data/brands.json');
// In-memory fallback if needed
const DEFAULT_DEMO_BRAND = {
    id: 'demo-brand',
    name: 'NovaTech',
    description: 'Enterprise cloud and AI infrastructure provider committed to high reliability and transparent governance.',
    tone: ['professional', 'innovative', 'authoritative', 'accessible'],
    guidelines: {
        terminology: [
            {
                preferred: 'NovaTech Cloud Platform',
                discouraged: ['Nova Cloud', 'NovaTech CP', 'NT Cloud'],
                explanation: 'Always refer to our core offering by its complete official brand name.'
            },
            {
                preferred: 'Autonomous Intelligence',
                discouraged: ['Bot', 'Robot', 'Script'],
                explanation: 'Reflect modern AI terminology in customer-facing communication.'
            }
        ],
        restrictedPhrases: [
            {
                phrase: '100% bug-free',
                severity: 'high',
                explanation: 'Absolute reliability claims violate compliance policies.',
                suggestion: 'engineered for high reliability and resilience'
            },
            {
                phrase: 'cheapest cloud in the market',
                severity: 'high',
                explanation: 'Unsubstantiated pricing superlatives are prohibited.',
                suggestion: 'cost-effective, high-performance cloud infrastructure'
            },
            {
                phrase: 'obviously',
                severity: 'medium',
                explanation: 'Condescending tone undermines accessible brand voice.',
                suggestion: 'as demonstrated'
            }
        ],
        requiredTerms: [
            {
                term: 'NovaTech',
                context: 'Brand name must be mentioned explicitly at least once in public announcements.',
                severity: 'medium',
                explanation: 'Brand name must be mentioned explicitly at least once.'
            }
        ],
        claimVerification: [
            {
                claimPattern: 'guarantee(s|d)?',
                severity: 'high',
                explanation: 'Guarantees require explicit legal team approval and SLA references.',
                suggestion: 'commit to high availability under our standard SLA'
            }
        ],
        toneRules: [
            {
                bannedWordOrStyle: 'obviously',
                suggestion: 'as demonstrated',
                explanation: 'Condescending tone undermines accessible brand voice.'
            }
        ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
async function ensureDataFile() {
    try {
        await promises_1.default.access(DATA_FILE_PATH);
    }
    catch {
        const dir = path_1.default.dirname(DATA_FILE_PATH);
        await promises_1.default.mkdir(dir, { recursive: true });
        await promises_1.default.writeFile(DATA_FILE_PATH, JSON.stringify([DEFAULT_DEMO_BRAND], null, 2), 'utf-8');
    }
}
async function getAllBrands() {
    await ensureDataFile();
    try {
        const rawData = await promises_1.default.readFile(DATA_FILE_PATH, 'utf-8');
        const brands = JSON.parse(rawData);
        return brands;
    }
    catch (error) {
        console.error('Error reading brands file:', error);
        return [DEFAULT_DEMO_BRAND];
    }
}
async function getBrandById(brandId) {
    const brands = await getAllBrands();
    const found = brands.find((b) => b.id.toLowerCase() === brandId.toLowerCase());
    return found || null;
}
async function updateBrand(brandId, updatedData) {
    const brands = await getAllBrands();
    const index = brands.findIndex((b) => b.id.toLowerCase() === brandId.toLowerCase());
    if (index === -1) {
        return null;
    }
    const existing = brands[index];
    const updatedBrand = {
        ...existing,
        ...updatedData,
        guidelines: {
            ...existing.guidelines,
            ...(updatedData.guidelines || {})
        },
        updatedAt: new Date().toISOString()
    };
    brands[index] = updatedBrand;
    await ensureDataFile();
    await promises_1.default.writeFile(DATA_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');
    return updatedBrand;
}
async function createBrand(brand) {
    const brands = await getAllBrands();
    const existingIndex = brands.findIndex((b) => b.id.toLowerCase() === brand.id.toLowerCase());
    const now = new Date().toISOString();
    const brandToSave = {
        ...brand,
        createdAt: brand.createdAt || now,
        updatedAt: now
    };
    if (existingIndex !== -1) {
        brands[existingIndex] = brandToSave;
    }
    else {
        brands.push(brandToSave);
    }
    await ensureDataFile();
    await promises_1.default.writeFile(DATA_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');
    return brandToSave;
}
