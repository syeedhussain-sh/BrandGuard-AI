import { AnalysisIssue, BrandProfile, TerminologyRule } from '../types.js';
import { escapeRegex, findOccurrences, generateIssueId } from './utils.js';

/**
 * Checks for incorrect brand-name spelling and unapproved terminology.
 */
export function checkBrandNameAndTerminology(
  content: string,
  profile: BrandProfile
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!content || !profile) {
    return issues;
  }

  const officialName = (profile.name || profile.brandName || '').trim();

  // 1. Detect incorrect brand name spelling & case variations (if official brand name is known)
  if (officialName) {
    const explicitVariations = new Set<string>();

    if (Array.isArray(profile.brandVariations)) {
      for (const v of profile.brandVariations) {
        if (typeof v === 'string' && v.trim() && v.trim() !== officialName) {
          explicitVariations.add(v.trim());
        }
      }
    }

    // Common heuristic variations for brand names (e.g. "NovaTech" -> "Nova Tech", "Nova-Tech", "Novatech")
    const spacedCamel = officialName.replace(/([a-z])([A-Z])/g, '$1 $2');
    if (spacedCamel !== officialName) {
      explicitVariations.add(spacedCamel);
    }
    const hyphenated = officialName.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-');
    if (hyphenated !== officialName) {
      explicitVariations.add(hyphenated);
    }
    const noSpace = officialName.replace(/\s+/g, '');
    if (noSpace !== officialName) {
      explicitVariations.add(noSpace);
    }

    // Check explicit & heuristic variations (case-insensitive)
    for (const variation of explicitVariations) {
      const occurrences = findOccurrences(content, variation, false);
      for (const occ of occurrences) {
        if (occ.matchedText === officialName) continue;

        issues.push({
          id: generateIssueId('brand_spelling'),
          category: 'terminology',
          severity: 'high',
          matchedText: occ.matchedText,
          explanation: `Brand name should be written as "${officialName}" according to brand guidelines.`,
          suggestion: `Use "${officialName}" instead of "${occ.matchedText}".`,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }

    // Also check case mismatches on the official brand name itself
    const brandOccurrences = findOccurrences(content, officialName, false);
    for (const occ of brandOccurrences) {
      if (occ.matchedText !== officialName) {
        const alreadyCaught = issues.some(
          (i) => i.startIndex === occ.start && i.endIndex === occ.end
        );
        if (!alreadyCaught) {
          issues.push({
            id: generateIssueId('brand_case'),
            category: 'terminology',
            severity: 'high',
            matchedText: occ.matchedText,
            explanation: `Brand name casing should strictly match "${officialName}".`,
            suggestion: `Change "${occ.matchedText}" to "${officialName}".`,
            startIndex: occ.start,
            endIndex: occ.end,
          });
        }
      }
    }
  }

  // 2. Guidelines Terminology rules (Contract Section 5: preferred, discouraged: string[], explanation)
  if (profile.guidelines?.terminology && Array.isArray(profile.guidelines.terminology)) {
    for (const rule of profile.guidelines.terminology) {
      if (!rule || !rule.preferred) continue;

      if (Array.isArray(rule.discouraged)) {
        for (const discouragedTerm of rule.discouraged) {
          if (!discouragedTerm || typeof discouragedTerm !== 'string') continue;
          const occurrences = findOccurrences(content, discouragedTerm.trim(), false);

          for (const occ of occurrences) {
            // Avoid duplicate if identical span is already reported
            const alreadyCaught = issues.some(
              (i) => i.startIndex === occ.start && i.endIndex === occ.end
            );
            if (!alreadyCaught) {
              issues.push({
                id: generateIssueId('terminology'),
                category: 'terminology',
                severity: rule.severity || 'high',
                matchedText: occ.matchedText,
                explanation:
                  rule.explanation ||
                  `Always refer to our core offering by its complete official brand name.`,
                suggestion: rule.preferred,
                startIndex: occ.start,
                endIndex: occ.end,
              });
            }
          }
        }
      }

      // If term is also provided directly on the rule
      if (rule.term) {
        const occurrences = findOccurrences(content, rule.term, false);
        for (const occ of occurrences) {
          if (occ.matchedText.toLowerCase() === rule.preferred.toLowerCase()) continue;
          const alreadyCaught = issues.some(
            (i) => i.startIndex === occ.start && i.endIndex === occ.end
          );
          if (!alreadyCaught) {
            issues.push({
              id: generateIssueId('terminology'),
              category: 'terminology',
              severity: rule.severity || 'medium',
              matchedText: occ.matchedText,
              explanation:
                rule.explanation ||
                `Preferred brand terminology for "${occ.matchedText}" is "${rule.preferred}".`,
              suggestion: rule.preferred,
              startIndex: occ.start,
              endIndex: occ.end,
            });
          }
        }
      }
    }
  }

  // 3. Preferred terminology checks (Legacy support)
  const terminologyRules: TerminologyRule[] = [];

  if (profile.preferredTerminology) {
    if (Array.isArray(profile.preferredTerminology)) {
      terminologyRules.push(...profile.preferredTerminology);
    } else if (typeof profile.preferredTerminology === 'object') {
      for (const [term, preferred] of Object.entries(profile.preferredTerminology)) {
        if (typeof preferred === 'string') {
          terminologyRules.push({
            term,
            preferred,
          });
        }
      }
    }
  }

  for (const rule of terminologyRules) {
    if (!rule.term || !rule.preferred) continue;
    const occurrences = findOccurrences(content, rule.term, false);

    for (const occ of occurrences) {
      if (occ.matchedText.toLowerCase() === rule.preferred.toLowerCase()) continue;
      const alreadyCaught = issues.some(
        (i) => i.startIndex === occ.start && i.endIndex === occ.end
      );
      if (!alreadyCaught) {
        issues.push({
          id: generateIssueId('terminology'),
          category: 'terminology',
          severity: rule.severity || 'medium',
          matchedText: occ.matchedText,
          explanation:
            rule.explanation ||
            `Preferred brand terminology for "${occ.matchedText}" is "${rule.preferred}".`,
          suggestion: `Replace "${occ.matchedText}" with "${rule.preferred}".`,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }
  }

  return issues;
}
