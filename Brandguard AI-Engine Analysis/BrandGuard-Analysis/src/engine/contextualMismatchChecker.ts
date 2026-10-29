import { AnalysisIssue } from '../types.js';
import { generateIssueId } from './utils.js';
import { KNOWN_BRAND_REGISTRY } from './brandMismatchChecker.js';

interface IndustryContextConfig {
  industryKeywords: string[];
  vehicleOfferingRegex: RegExp;
  legitimateDeliveryRegex: RegExp;
}

const FOOD_INDUSTRY_CONFIG: IndustryContextConfig = {
  industryKeywords: [
    'food',
    'restaurant',
    'dining',
    'beverage',
    'fast food',
    'cafe',
    'culinary',
    'bakery',
    'catering',
    'meal',
    'meals',
    'chicken',
    'burger',
  ],
  // Matches vehicle offerings by a food brand: "provides good bike", "manufactures motorcycles", "sells bikes", etc.
  vehicleOfferingRegex:
    /\b(?:provides?|provid(?:ing|ed)|sells?|selling|sold|manufactures?|manufactur(?:ing|ed)|produces?|produc(?:ing|ed)|makes?|making|made|offers?|offering|offered|builds?|building|built)\s+(?:(?:a|an|the|our|good|new|quality|reliable|custom)\s+)*(?:bikes?|bicycles?|motorcycles?|motorbikes?|cars?|vehicles?|trucks?|suvs?)(?:\s+and\s+(?:good\s+)?services?)?\b/gi,
  // Recognizes legitimate logistics/delivery in food business: "deliver meals using bicycles", "delivery by bike", etc.
  legitimateDeliveryRegex:
    /\b(?:deliver(?:s|ed|ing)?|delivery|transport(?:ing)?|courier)\s+(?:[a-z0-9\s,]+?\s+)?(?:using|with|via|by|on)\s+(?:bicycles?|bikes?|motorcycles?|scooters?|vehicles?|vans?|cars?)\b|\b(?:bicycles?|bikes?|motorcycles?|scooters?|vans?|cars?)\s+(?:are|is)?\s*(?:used|deployed)\s+(?:for|to)\s+(?:deliver|transport|courier)\b/gi,
};

const AUTOMOTIVE_INDUSTRY_CONFIG = {
  industryKeywords: [
    'automotive',
    'car',
    'vehicle',
    'motor',
    'transport',
    'mobility',
    'rubber',
    'tire',
    'tyre',
  ],
  // Matches food preparation offerings by an automotive brand
  foodOfferingRegex:
    /\b(?:prepares?|prepar(?:ing|ed)|cooks?|cook(?:ing|ed)|bakes?|bak(?:ing|ed)|serves?|serv(?:ing|ed))\s+(?:(?:a|an|the|our|fresh|hot|delicious|artisan)\s+)*(?:meals?|burgers?|pizzas?|chickens?|fast\s+food|fries|sandwiches?)(?:\s+and\s+(?:good\s+)?services?)?\b/gi,
  // Legitimate automotive in-cabin food/drink references
  legitimateCabinRegex:
    /\b(?:cup\s+holders?|drink\s+holders?|drive-thru|cooler\s+box|refrigerated\s+transport)\b/gi,
};

/**
 * Dynamically resolves the normalized industry sector using explicit industry or brand registry.
 */
function detectIndustry(industry?: string, companyName?: string): 'food' | 'automotive' | 'technology' | 'clothing' | 'general' {
  const ind = (industry || '').toLowerCase().trim();
  if (ind) {
    if (FOOD_INDUSTRY_CONFIG.industryKeywords.some((kw) => ind.includes(kw))) return 'food';
    if (AUTOMOTIVE_INDUSTRY_CONFIG.industryKeywords.some((kw) => ind.includes(kw))) return 'automotive';
    if (/\b(?:tech|technology|software|cloud|saas|it|computing|platform|ai)\b/.test(ind)) return 'technology';
    if (/\b(?:cloth|clothing|fashion|apparel|footwear|wear)\b/.test(ind)) return 'clothing';
  }

  const comp = (companyName || '').toLowerCase().trim();
  if (comp) {
    for (const entity of KNOWN_BRAND_REGISTRY) {
      const isMatch =
        entity.name.toLowerCase() === comp ||
        entity.aliases.some((a) => a.toLowerCase() === comp);
      if (isMatch && entity.industry) {
        return detectIndustry(entity.industry);
      }
    }
  }

  return 'general';
}

/**
 * Checks content for contextual product and industry mismatches.
 *
 * @param content - User submitted marketing copy
 * @param companyName - Active brand/company name (e.g. "KFC", "Tata Motors")
 * @param industry - Active industry (e.g. "Food and Restaurants", "Automotive")
 */
export function checkContextualIndustryMismatch(
  content: string,
  companyName?: string,
  industry?: string
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!content || !content.trim()) return issues;

  const cleanCompany = (companyName || 'The brand').trim();
  const cleanIndustry = (industry || 'selected').trim();
  const resolvedSector = detectIndustry(industry, companyName);

  // 1. Food & Restaurant Industry contextual checks
  if (resolvedSector === 'food') {
    // Recognize legitimate delivery logistics
    const legitimateDeliveryMatches: { start: number; end: number }[] = [];
    let legitMatch: RegExpExecArray | null;
    const legitRegex = new RegExp(FOOD_INDUSTRY_CONFIG.legitimateDeliveryRegex.source, 'gi');

    while ((legitMatch = legitRegex.exec(content)) !== null) {
      legitimateDeliveryMatches.push({
        start: legitMatch.index,
        end: legitMatch.index + legitMatch[0].length,
      });
    }

    // Check for vehicle offering claims
    const offeringRegex = new RegExp(FOOD_INDUSTRY_CONFIG.vehicleOfferingRegex.source, 'gi');
    let offMatch: RegExpExecArray | null;

    while ((offMatch = offeringRegex.exec(content)) !== null) {
      const matchIndex = offMatch.index;
      const matchEnd = matchIndex + offMatch[0].length;
      const matchedText = offMatch[0];

      const isLegitimate = legitimateDeliveryMatches.some(
        (span) => matchIndex >= span.start && matchEnd <= span.end
      );

      if (isLegitimate) {
        continue;
      }

      const lower = matchedText.toLowerCase();
      let suggestion = 'provides quality food and dependable service';

      if (lower.includes('bike and good services') || lower.includes('and good services')) {
        suggestion = lower.includes('provide') ? 'provides quality food and good services' : 'quality food and good services';
      } else if (lower.includes('manufacture') || lower.includes('produces') || lower.includes('builds')) {
        suggestion = 'prepares and serves quality food products';
      } else if (lower.includes('provides good bike') || lower.includes('provides bike')) {
        suggestion = 'provides quality food';
      } else if (lower.includes('good bike') || lower.includes('bike')) {
        suggestion = 'quality food';
      } else if (lower.includes('sells')) {
        suggestion = 'serves quality meals';
      }

      issues.push({
        id: generateIssueId('contextual_mismatch'),
        category: 'claim_verification',
        severity: 'high',
        matchedText,
        explanation: `Offering or manufacturing vehicles ("${matchedText}") appears inconsistent with ${cleanCompany}'s business in the ${cleanIndustry} industry. Check whether this is a product mismatch, or clarify if bicycles/vehicles are used for delivery logistics.`,
        suggestion,
        startIndex: matchIndex,
        endIndex: matchEnd,
      });
    }

    // Also check standalone "provides good bike" / "good bike" if offeringRegex missed boundary
    if (issues.length === 0) {
      const specificBikeCheck = /\b(?:provides?\s+)?good\s+bikes?(?:\s+and\s+good\s+services?)?\b/gi;
      let bikeMatch: RegExpExecArray | null;
      while ((bikeMatch = specificBikeCheck.exec(content)) !== null) {
        const matchIndex = bikeMatch.index;
        const matchEnd = matchIndex + bikeMatch[0].length;
        const matchedText = bikeMatch[0];

        const isLegitimate = legitimateDeliveryMatches.some(
          (span) => matchIndex >= span.start && matchEnd <= span.end
        );

        if (!isLegitimate) {
          const lower = matchedText.toLowerCase();
          const hasAndServices = lower.includes('and good services');
          const isProvides = lower.includes('provide');
          let suggestion = 'quality food';
          if (isProvides && hasAndServices) {
            suggestion = 'provides quality food and good services';
          } else if (isProvides) {
            suggestion = 'provides quality food';
          } else if (hasAndServices) {
            suggestion = 'quality food and good services';
          }

          issues.push({
            id: generateIssueId('contextual_mismatch'),
            category: 'claim_verification',
            severity: 'high',
            matchedText,
            explanation: `Offering or manufacturing vehicles ("${matchedText}") appears inconsistent with ${cleanCompany}'s business in the ${cleanIndustry} industry. Check whether this is a product mismatch, or clarify if bicycles/vehicles are used for delivery logistics.`,
            suggestion,
            startIndex: matchIndex,
            endIndex: matchEnd,
          });
        }
      }
    }
  }

  // 2. Automotive & Mobility Industry contextual checks
  if (resolvedSector === 'automotive') {
    const foodRegex = new RegExp(AUTOMOTIVE_INDUSTRY_CONFIG.foodOfferingRegex.source, 'gi');
    let foodMatch: RegExpExecArray | null;

    while ((foodMatch = foodRegex.exec(content)) !== null) {
      const matchIndex = foodMatch.index;
      const matchEnd = matchIndex + foodMatch[0].length;
      const matchedText = foodMatch[0];

      // Check legitimate cabin/comfort features
      const cabinRegex = new RegExp(AUTOMOTIVE_INDUSTRY_CONFIG.legitimateCabinRegex.source, 'gi');
      if (cabinRegex.test(content)) {
        continue;
      }

      issues.push({
        id: generateIssueId('contextual_mismatch'),
        category: 'claim_verification',
        severity: 'high',
        matchedText,
        explanation: `Preparing or serving food ("${matchedText}") appears inconsistent with ${cleanCompany}'s business in the ${cleanIndustry} industry. Check whether this is a product mismatch, or clarify the commercial context.`,
        suggestion: 'engineers quality passenger vehicles',
        startIndex: matchIndex,
        endIndex: matchEnd,
      });
    }
  }

  return issues;
}
