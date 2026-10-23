/**
 * BrandGuard AI - Company Identity and Brand Mismatch Checker
 *
 * Validates that marketing content aligns with the selected company identity.
 * Detects when marketing copy appears to reference a different commercial company,
 * competitor brand, or mismatched product context.
 */

import { AnalysisIssue } from '../types.js';
import { generateIssueId } from './utils.js';

export interface BrandEntity {
  name: string;
  aliases: string[];
  industry: string;
  keywords?: string[];
}

/**
 * Curated registry of recognized commercial brands across major industries.
 * Used for entity identification and detecting cross-brand contamination.
 */
export const KNOWN_BRAND_REGISTRY: BrandEntity[] = [
  // Enterprise Cloud & AI / Tech
  {
    name: 'NovaTech',
    aliases: ['NovaTech Cloud Platform', 'NovaTech Cloud', 'NovaTech CP', 'NovaTech', 'Nova Cloud', 'Nova CP'],
    industry: 'Enterprise Cloud and AI',
    keywords: ['cloud', 'platform', 'infrastructure', 'sla', 'autonomous intelligence'],
  },
  // Electronics & Mobile
  {
    name: 'Samsung',
    aliases: ['Samsung Galaxy', 'Samsung One UI', 'Samsung Electronics', 'Samsung', 'Galaxy Phone', 'Sammy'],
    industry: 'Mobile phones and electronics',
    keywords: ['galaxy', 'one ui', 'smartphone', 'amoled', 'exynos', 'foldable'],
  },
  {
    name: 'Apple',
    aliases: ['Apple Inc', 'Apple iPhone', 'Apple', 'iPhone', 'iPad', 'MacBook', 'iOS'],
    industry: 'Mobile phones and electronics',
    keywords: ['iphone', 'macbook', 'ios', 'retina', 'apple store'],
  },
  {
    name: 'Xiaomi',
    aliases: ['Xiaomi Redmi', 'Redmi Note', 'Xiaomi', 'MIUI', 'HyperOS'],
    industry: 'Mobile phones and electronics',
    keywords: ['redmi', 'miui', 'hyperos'],
  },
  {
    name: 'OnePlus',
    aliases: ['OnePlus Nord', 'OxygenOS', 'OnePlus'],
    industry: 'Mobile phones and electronics',
    keywords: ['oxygenos', 'warp charge'],
  },
  // Automotive
  {
    name: 'Tata Motors',
    aliases: ['Tata Motors Passenger Vehicles', 'Tata Motors EV', 'Tata Motors', 'Tata Safari', 'Tata Nexon', 'Tata Harrier'],
    industry: 'Automotive',
    keywords: ['nexon', 'harrier', 'safari', 'icng', 'tiago', 'altroz', 'suv', 'trucks'],
  },
  {
    name: 'MRF Tyres',
    aliases: ['MRF Tyres', 'MRF Radial', 'MRF ZLX', 'MRF Wanderer', 'MRF Tyre', 'MRF'],
    industry: 'Automotive & Rubber',
    keywords: ['tyres', 'tread', 'radial', 'steel radial', 'puncture', 'grip'],
  },
  {
    name: 'BMW',
    aliases: ['BMW Motorsport', 'BMW M', 'BMW'],
    industry: 'Automotive',
    keywords: ['xdrive', 'ultimate driving machine', 'bimmer'],
  },
  {
    name: 'Toyota',
    aliases: ['Toyota Motor', 'Toyota Hybrid', 'Toyota', 'Lexus'],
    industry: 'Automotive',
    keywords: ['camry', 'corolla', 'fortuner', 'prius', 'hybrid'],
  },
  {
    name: 'Hyundai',
    aliases: ['Hyundai Motor', 'Hyundai Creta', 'Hyundai Ioniq', 'Hyundai'],
    industry: 'Automotive',
    keywords: ['creta', 'venue', 'tucson', 'ioniq'],
  },
  // Food & Beverages
  {
    name: "McDonald's",
    aliases: ["McDonald's", "McDonalds", 'Big Mac', 'McFlurry', 'Golden Arches'],
    industry: 'Food and beverages',
    keywords: ['burger', 'fries', 'big mac', 'happy meal'],
  },
  {
    name: 'Coca-Cola',
    aliases: ['Coca-Cola', 'Coca Cola', 'Coke Zero', 'Diet Coke', 'Coke'],
    industry: 'Food and beverages',
    keywords: ['soft drink', 'soda', 'coke'],
  },
  {
    name: 'Pepsi',
    aliases: ['PepsiCo', 'Pepsi Max', 'Diet Pepsi', 'Pepsi'],
    industry: 'Food and beverages',
    keywords: ['soft drink', 'soda', 'pepsi'],
  },
  {
    name: 'Nestlé',
    aliases: ['Nestle', 'Nescafé', 'Nescafe', 'KitKat', 'Maggi'],
    industry: 'Food and beverages',
    keywords: ['coffee', 'chocolate', 'confectionery'],
  },
  // Clothing & Fashion
  {
    name: 'Nike',
    aliases: ['Nike Running', 'Nike Air', 'Nike Sportswear', 'Nike'],
    industry: 'Clothing and fashion',
    keywords: ['sneakers', 'air jordan', 'air max', 'just do it'],
  },
  {
    name: 'Adidas',
    aliases: ['Adidas Originals', 'Adidas Boost', 'Adidas'],
    industry: 'Clothing and fashion',
    keywords: ['three stripes', 'ultraboost', 'sneakers'],
  },
  {
    name: 'Zara',
    aliases: ['Zara Fashion', 'Zara'],
    industry: 'Clothing and fashion',
    keywords: ['apparel', 'fast fashion', 'clothing'],
  },
  {
    name: 'H&M',
    aliases: ['Hennes & Mauritz', 'H&M'],
    industry: 'Clothing and fashion',
    keywords: ['clothing', 'fashion'],
  },
  // Tech & Software
  {
    name: 'Microsoft',
    aliases: ['Microsoft Azure', 'Microsoft 365', 'Microsoft Copilot', 'Microsoft'],
    industry: 'Technology and software',
    keywords: ['azure', 'windows', 'office 365', 'copilot'],
  },
  {
    name: 'Google',
    aliases: ['Google Cloud', 'Google Workspace', 'Google Gemini', 'Google'],
    industry: 'Technology and software',
    keywords: ['gcp', 'gemini', 'workspace', 'search'],
  },
  {
    name: 'Infosys',
    aliases: ['Infosys BPM', 'Infosys Cobalt', 'Infosys Technologies', 'Infosys'],
    industry: 'Technology and software',
    keywords: ['it consulting', 'outsourcing', 'digital transformation'],
  },
  {
    name: 'TCS',
    aliases: ['Tata Consultancy Services', 'TCS'],
    industry: 'Technology and software',
    keywords: ['it consulting', 'tcs bancs'],
  },
  // Retail & E-commerce
  {
    name: 'Amazon',
    aliases: ['Amazon Prime', 'Amazon Web Services', 'Amazon.com', 'Amazon'],
    industry: 'Retail and e-commerce',
    keywords: ['ecommerce', 'prime delivery', 'aws'],
  },
  {
    name: 'Flipkart',
    aliases: ['Flipkart Plus', 'Flipkart Big Billion', 'Flipkart'],
    industry: 'Retail and e-commerce',
    keywords: ['ecommerce', 'online shopping'],
  },
];

/**
 * Checks whether an entity alias matches the selected target company.
 */
function isSelectedCompanyMatch(
  targetCompany: string,
  entityName: string,
  entityAliases: string[]
): boolean {
  if (!targetCompany) return false;
  const cleanTarget = targetCompany.trim().toLowerCase();
  const cleanEntity = entityName.trim().toLowerCase();

  if (cleanTarget === cleanEntity) return true;
  if (cleanTarget.includes(cleanEntity) || cleanEntity.includes(cleanTarget)) return true;

  for (const alias of entityAliases) {
    const cleanAlias = alias.trim().toLowerCase();
    if (cleanTarget === cleanAlias) return true;
    if (cleanTarget.includes(cleanAlias) || cleanAlias.includes(cleanTarget)) return true;
  }

  return false;
}

/**
 * Escapes regex special characters in a search term.
 */
function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a matched term is ambiguous or used in an ordinary non-brand English sense.
 * Returns true if the match appears to be a genuine brand reference.
 */
function isGenuineBrandContext(content: string, matchIndex: number, matchedText: string): boolean {
  const lower = matchedText.toLowerCase();

  // 1. "Nova" by itself: only consider it a brand reference if accompanied by
  // promotional/entity context like "Nova Cloud", "Our Nova", "Nova platform", "by Nova",
  // or capitalized standalone proper noun, not "super nova" or "bossa nova".
  if (lower === 'nova') {
    const preceding = content.slice(Math.max(0, matchIndex - 15), matchIndex).toLowerCase();
    const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();

    if (preceding.includes('super') || preceding.includes('bossa') || preceding.includes('chevy')) {
      return false;
    }
    // Check if followed by commercial words: "cloud", "tech", "platform", "cp", "services"
    if (/\b(?:cloud|platform|cp|infrastructure|suite|systems?|services?)\b/.test(following)) {
      return true;
    }
    // Check if preceded by possessives or entity markers: "our nova", "at nova", "visit nova", "choose nova"
    if (/\b(?:our|at|with|by|from|visit|choose|trust|meet)\s+$/i.test(preceding)) {
      return true;
    }
    // Otherwise, standalone "Nova" capitalized at sentence start might be a name
    return /^[A-Z]/.test(matchedText);
  }

  // 2. "Apple": avoid "eating an apple", "apple pie", etc.
  if (lower === 'apple') {
    const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
    if (/\b(?:pie|cider|sauce|tree|orchard|juice|fruit)\b/.test(following)) {
      return false;
    }
  }

  // 3. "Tata": avoid non-brand contexts
  if (lower === 'tata') {
    const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
    if (/\b(?:bye|ta-ta)\b/.test(following)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks content for references to foreign companies or competitor entities
 * that differ from the selected active company.
 *
 * @param content - The marketing copy submitted by the user.
 * @param selectedCompany - The active company or brand name selected in the audit context.
 * @param selectedIndustry - The active industry selected (optional).
 * @returns Array of AnalysisIssue items flagging detected company identity mismatches.
 */
export function checkCompanyIdentityMismatch(
  content: string,
  selectedCompany?: string,
  selectedIndustry?: string
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!content || !content.trim() || !selectedCompany || !selectedCompany.trim()) {
    return issues;
  }

  const cleanSelected = selectedCompany.trim();

  // Evaluate against all known brands in the registry
  for (const entity of KNOWN_BRAND_REGISTRY) {
    // If the entity matches the selected company, skip it (it's the correct brand!)
    if (isSelectedCompanyMatch(cleanSelected, entity.name, entity.aliases)) {
      continue;
    }

    // Sort aliases by length descending so longer compound names (e.g. "NovaTech Cloud Platform")
    // match before shorter substrings (e.g. "Nova")
    const sortedAliases = [...entity.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const escaped = escapeRegex(alias);
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + matchedText.length;

        // Check if genuine brand reference rather than incidental word usage
        if (!isGenuineBrandContext(content, startIndex, matchedText)) {
          continue;
        }

        // Avoid duplicate issue on the same or overlapping text span
        const alreadyCaught = issues.some(
          (i) =>
            (i.startIndex !== undefined &&
              i.endIndex !== undefined &&
              startIndex < i.endIndex &&
              endIndex > i.startIndex)
        );

        if (!alreadyCaught) {
          const industryHint = entity.industry ? ` (${entity.industry})` : '';
          issues.push({
            id: generateIssueId('brand_identity'),
            category: 'terminology',
            severity: 'high',
            matchedText,
            explanation: `Content references "${matchedText}"${industryHint}, which appears to be a different company than the selected brand ("${cleanSelected}"). Ensure marketing copy aligns with the intended brand identity.`,
            suggestion: `Replace with "${cleanSelected}" if this material is intended for ${cleanSelected}, or clarify the context.`,
            startIndex,
            endIndex,
          });
        }
      }
    }
  }

  return issues;
}
