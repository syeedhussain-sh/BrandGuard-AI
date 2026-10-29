import fs from 'fs/promises';
import path from 'path';
import { BrandProfile } from '../types';

const DATA_FILE_PATH = path.resolve(__dirname, '../data/brands.json');

// In-memory fallback if needed
const DEFAULT_DEMO_BRAND: BrandProfile = {
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
  approvedFacts: [
    'NovaTech provides 99.99% availability under our Enterprise SLA.',
    'NovaTech Cloud Platform is ISO/IEC 27001 certified for cloud security.',
    'NovaTech was ranked #1 in customer satisfaction by TechReview 2024'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify([DEFAULT_DEMO_BRAND], null, 2), 'utf-8');
  }
}

export async function getAllBrands(): Promise<BrandProfile[]> {
  await ensureDataFile();
  try {
    const rawData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    if (!rawData || !rawData.trim()) {
      return [DEFAULT_DEMO_BRAND];
    }
    const brands: BrandProfile[] = JSON.parse(rawData);
    return brands;
  } catch (error) {
    console.error('Error reading brands file:', error);
    return [DEFAULT_DEMO_BRAND];
  }
}

export async function getBrandById(brandId: string): Promise<BrandProfile | null> {
  const brands = await getAllBrands();
  const found = brands.find((b) => b.id.toLowerCase() === brandId.toLowerCase());
  return found || null;
}

export async function getBrandByName(name: string): Promise<BrandProfile | null> {
  if (!name || !name.trim()) return null;
  const brands = await getAllBrands();
  const target = name.trim().toLowerCase();
  const found = brands.find(
    (b) => b.name.toLowerCase() === target || b.id.toLowerCase() === target
  );
  return found || null;
}

export async function updateBrand(
  brandId: string,
  updatedData: Partial<Omit<BrandProfile, 'id' | 'createdAt'>>
): Promise<BrandProfile | null> {
  const brands = await getAllBrands();
  const index = brands.findIndex((b) => b.id.toLowerCase() === brandId.toLowerCase());

  if (index === -1) {
    return null;
  }

  const existing = brands[index];
  const updatedBrand: BrandProfile = {
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
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');

  return updatedBrand;
}

export async function createBrand(brand: BrandProfile): Promise<BrandProfile> {
  const brands = await getAllBrands();
  const existingIndex = brands.findIndex((b) => b.id.toLowerCase() === brand.id.toLowerCase());

  const now = new Date().toISOString();
  const brandToSave: BrandProfile = {
    ...brand,
    createdAt: brand.createdAt || now,
    updatedAt: now
  };

  if (existingIndex !== -1) {
    brands[existingIndex] = brandToSave;
  } else {
    brands.push(brandToSave);
  }

  await ensureDataFile();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(brands, null, 2), 'utf-8');

  return brandToSave;
}
