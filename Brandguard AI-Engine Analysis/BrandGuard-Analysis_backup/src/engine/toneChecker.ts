import { AnalysisIssue, BrandProfile, ToneGuidelines } from '../types.js';
import { findOccurrences, generateIssueId } from './utils.js';

const COMMON_SLANG_MAP: Record<string, string> = {
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'have to',
  kinda: 'somewhat',
  sorta: 'somewhat',
  dunno: 'do not know',
  yeah: 'yes',
  yep: 'yes',
  nope: 'no',
  aint: 'is not',
  "ain't": 'is not',
  imo: 'in our view',
  imho: 'in our view',
  omg: 'notably',
  lol: '',
  crap: 'poor quality',
  sucks: 'is unsatisfactory',
  kickass: 'industry-leading',
  badass: 'exceptional',
  legit: 'legitimate',
  noob: 'beginner',
  dude: 'customer',
  folks: 'clients',
};

const AGGRESSIVE_CLICKBAIT_PATTERNS: Array<{ pattern: RegExp; explanation: string; suggestion: string }> = [
  {
    pattern: /!{2,}/g,
    explanation: 'Multiple exclamation marks can appear unprofessional or aggressive.',
    suggestion: 'Use a single exclamation mark or a period.',
  },
  {
    pattern: /\?!|\?!+/g,
    explanation: 'Interrobang or combined punctuation appears informal or confrontational.',
    suggestion: 'Use standard punctuation.',
  },
];

/**
 * Checks content against brand tone guidelines.
 */
export function checkToneGuidelines(
  content: string,
  profile: BrandProfile
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!content || !profile) {
    return issues;
  }

  // 1. Guidelines custom tone rules (Contract Section 5: bannedWordOrStyle, suggestion, explanation)
  if (profile.guidelines?.toneRules && Array.isArray(profile.guidelines.toneRules)) {
    for (const rule of profile.guidelines.toneRules) {
      if (!rule || !rule.bannedWordOrStyle) continue;
      const occurrences = findOccurrences(content, rule.bannedWordOrStyle.trim(), false);
      for (const occ of occurrences) {
        issues.push({
          id: generateIssueId('tone'),
          category: 'tone',
          severity: 'medium',
          matchedText: occ.matchedText,
          explanation: rule.explanation || `Phrase violates tone guidelines.`,
          suggestion: rule.suggestion || `Replace or rephrase "${occ.matchedText}".`,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }
  }

  // If no tone configuration or tone guidelines are provided, exit early
  if (!profile.toneGuidelines && !profile.tone) {
    return issues;
  }

  // Normalize tone guidelines
  let toneConfig: ToneGuidelines = {};

  if (Array.isArray(profile.tone)) {
    const tones = profile.tone.map((s) => s.toLowerCase());
    const isProfessional = tones.some((t) =>
      ['professional', 'authoritative', 'formal', 'corporate'].includes(t)
    );
    toneConfig = {
      primaryTone: tones[0] || 'professional',
      avoidSlang: isProfessional,
      avoidAggressivePunctuation: true,
      avoidExcessiveCapitalization: true,
    };
  } else if (typeof profile.toneGuidelines === 'string') {
    toneConfig = {
      primaryTone: profile.toneGuidelines.toLowerCase(),
      avoidSlang: ['professional', 'formal', 'authoritative', 'corporate'].includes(
        profile.toneGuidelines.toLowerCase()
      ),
      avoidAggressivePunctuation: true,
      avoidExcessiveCapitalization: true,
    };
  } else if (Array.isArray(profile.toneGuidelines)) {
    const list = profile.toneGuidelines.map((s) => s.toLowerCase());
    toneConfig = {
      primaryTone: list[0] || 'professional',
      avoidSlang: list.some((item) =>
        ['professional', 'formal', 'corporate', 'no-slang', 'no slang'].includes(item)
      ),
      avoidAggressivePunctuation: true,
      avoidExcessiveCapitalization: true,
      disallowedWords: list.slice(1),
    };
  } else if (typeof profile.toneGuidelines === 'object') {
    toneConfig = { ...profile.toneGuidelines };
    if (toneConfig.avoidSlang === undefined) {
      const p = (toneConfig.primaryTone || '').toLowerCase();
      toneConfig.avoidSlang = ['professional', 'formal', 'authoritative', 'corporate'].includes(p);
    }
    if (toneConfig.avoidAggressivePunctuation === undefined) {
      toneConfig.avoidAggressivePunctuation = true;
    }
  }

  const primaryTone = toneConfig.primaryTone || 'professional';

  // 1. Check custom disallowed words in tone guidelines
  if (Array.isArray(toneConfig.disallowedWords)) {
    for (const word of toneConfig.disallowedWords) {
      if (!word || typeof word !== 'string') continue;
      const occurrences = findOccurrences(content, word.trim(), false);
      for (const occ of occurrences) {
        issues.push({
          id: generateIssueId('tone_disallowed'),
          category: 'tone',
          severity: toneConfig.severity || 'medium',
          matchedText: occ.matchedText,
          explanation: `Word "${occ.matchedText}" does not align with the requested ${primaryTone} tone.`,
          suggestion: `Replace or remove "${occ.matchedText}" to maintain a ${primaryTone} voice.`,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }
  }

  // 2. Check slang if tone is professional/formal
  if (toneConfig.avoidSlang) {
    for (const [slang, replacement] of Object.entries(COMMON_SLANG_MAP)) {
      const occurrences = findOccurrences(content, slang, false);
      for (const occ of occurrences) {
        issues.push({
          id: generateIssueId('tone_slang'),
          category: 'tone',
          severity: 'low',
          matchedText: occ.matchedText,
          explanation: `Informal phrasing "${occ.matchedText}" does not align with a ${primaryTone} brand voice.`,
          suggestion: replacement
            ? `Use "${replacement}" instead of "${occ.matchedText}".`
            : `Remove "${occ.matchedText}".`,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }
  }

  // 3. Check aggressive punctuation
  if (toneConfig.avoidAggressivePunctuation) {
    for (const check of AGGRESSIVE_CLICKBAIT_PATTERNS) {
      let match: RegExpExecArray | null;
      const regex = new RegExp(check.pattern.source, 'g');
      while ((match = regex.exec(content)) !== null) {
        issues.push({
          id: generateIssueId('tone_punct'),
          category: 'tone',
          severity: 'low',
          matchedText: match[0],
          explanation: check.explanation,
          suggestion: check.suggestion,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  // 4. Check excessive capitalization (e.g. ALL CAPS words with 4+ letters, ignoring approved brand name or acronyms)
  if (toneConfig.avoidExcessiveCapitalization) {
    const allCapsRegex = /\b[A-Z]{4,}\b/g;
    let match: RegExpExecArray | null;
    while ((match = allCapsRegex.exec(content)) !== null) {
      const word = match[0];
      // Skip if it is the brand name itself
      if (profile.brandName && word.toUpperCase() === profile.brandName.toUpperCase()) {
        continue;
      }
      // Common acronyms to preserve
      if (['HTML', 'HTTP', 'HTTPS', 'JSON', 'REST', 'SaaS', 'API', 'AI', 'LLM', 'CEO', 'CTO', 'CFO', 'USA', 'UK', 'EU', 'B2B', 'B2C', 'GDPR', 'HIPAA'].includes(word)) {
        continue;
      }

      issues.push({
        id: generateIssueId('tone_caps'),
        category: 'tone',
        severity: 'low',
        matchedText: word,
        explanation: `ALL-CAPS words like "${word}" can feel like shouting and violate brand guidelines.`,
        suggestion: `Use standard title case or lower case: "${word.charAt(0) + word.slice(1).toLowerCase()}".`,
        startIndex: match.index,
        endIndex: match.index + word.length,
      });
    }
  }

  return issues;
}
