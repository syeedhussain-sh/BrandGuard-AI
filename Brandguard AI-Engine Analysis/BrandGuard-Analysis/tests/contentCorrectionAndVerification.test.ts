import { describe, it, expect } from 'vitest';
import { analyzeContentSync } from '../src/index.js';

describe('Content Analysis and Intelligent Correction Functionality', () => {
  // Test 1: Legitimate contextual reference (bicycle delivery for food business)
  it('does NOT flag legitimate food-delivery sentences mentioning bicycles as an industry mismatch', () => {
    const content = 'We deliver meals using bicycles in selected locations.';
    const result = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food',
      isGeneric: true,
    });

    expect(result.success).toBe(true);
    // Bicycles used for meal delivery is a legitimate contextual reference
    const mismatchIssue = result.issues.find(
      (i) => i.id.includes('contextual_mismatch') || i.explanation.includes('vehicles')
    );
    expect(mismatchIssue).toBeUndefined();
    expect(result.summary.totalIssues).toBe(0);
    expect(result.correctedContent).toBe(content);
  });

  // Test 2: Product name preservation (Nova Cloud must remain Nova Cloud)
  it('preserves product identity "Nova Cloud" and never replaces it with "KFC"', () => {
    const content =
      'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';
    const result = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food',
      isGeneric: true,
    });

    expect(result.success).toBe(true);
    // 1. Must flag cross-company brand mismatch warning
    const brandMismatch = result.issues.find(
      (i) => i.matchedText === 'Nova Cloud' || i.id.includes('brand_identity')
    );
    expect(brandMismatch).toBeDefined();

    // 2. CRITICAL: Corrected content must PRESERVE "Nova Cloud" and NOT replace it with "KFC"!
    expect(result.correctedContent).toContain('Our Nova Cloud');
    expect(result.correctedContent).not.toContain('Our KFC');

    // 3. Problematic claims should be corrected cleanly
    expect(result.correctedContent).not.toContain('cheapest cloud in the market');
    expect(result.correctedContent).not.toContain('obviously');
    expect(result.correctedContent).not.toContain('100% bug-free');
    expect(result.correctedContent).not.toContain('total perfection');
  });

  // Test 3: Contextual mismatch for food company offering vehicles
  it('detects product/industry mismatch when food brand claims to provide bikes or vehicles', () => {
    const content = 'KFC provides good bike and good services.';
    const result = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food',
      isGeneric: true,
    });

    expect(result.success).toBe(true);
    expect(result.summary.totalIssues).toBeGreaterThan(0);

    const mismatch = result.issues.find(
      (i) => i.id.includes('contextual_mismatch') || i.explanation.includes('vehicles')
    );
    expect(mismatch).toBeDefined();
    expect(mismatch?.severity).toBe('high');
    expect(mismatch?.explanation).toContain('KFC');

    // Corrected content should replace the vehicle offering with appropriate food/service wording
    expect(result.correctedContent).not.toContain('good bike');
    expect(result.correctedContent).toContain('KFC provides quality food and good services.');
  });

  // Test 4: Unsupported absolute marketing claim (world's best + guarantees perfect results)
  it('identifies unsupported absolute marketing claims and qualifies them in the correction', () => {
    const content = 'Our product is the world\'s best and guarantees perfect results every time.';
    const result = analyzeContentSync(content, {
      name: 'OmniCorp',
      companyName: 'OmniCorp',
      industry: 'Manufacturing',
      isGeneric: true,
    });

    expect(result.summary.totalIssues).toBeGreaterThanOrEqual(2);
    expect(result.issues.some((i) => i.matchedText.includes("world's best"))).toBe(true);
    expect(result.issues.some((i) => i.matchedText.includes('perfect results'))).toBe(true);

    // Corrected content differs from original
    expect(result.correctedContent).not.toBe(content);
    expect(result.correctedContent).not.toContain("world's best");
    expect(result.correctedContent).not.toContain('guarantees perfect results');
    expect(result.correctedContent).toContain('leading solution');
  });

  // Test 5: Technology absolute security claim
  it('identifies absolute security claims in tech software and suggests defensible wording', () => {
    const content = 'Our software is completely immune to every cyberattack.';
    const result = analyzeContentSync(content, {
      name: 'CyberShield',
      companyName: 'CyberShield',
      industry: 'Technology and software',
      isGeneric: true,
    });

    expect(result.summary.totalIssues).toBeGreaterThanOrEqual(1);
    const securityIssue = result.issues.find(
      (i) => i.matchedText.includes('immune') || i.explanation.includes('cyberattack')
    );
    expect(securityIssue).toBeDefined();
    expect(result.correctedContent).not.toContain('completely immune');
    expect(result.correctedContent).toContain('defenses against modern cyberattacks');
  });

  // Test 6: Content without issues is not rewritten unnecessarily
  it('does NOT rewrite compliant content that has no detected issues', () => {
    const content = 'Our team is committed to continuous improvement and customer collaboration.';
    const result = analyzeContentSync(content, {
      name: 'Apex Systems',
      companyName: 'Apex Systems',
      industry: 'Technology and software',
      isGeneric: true,
    });

    expect(result.summary.totalIssues).toBe(0);
    expect(result.issues.length).toBe(0);
    expect(result.correctedContent).toBe(content);
  });

  // Test 7: Corrected content preserves original meaning and sentence structure
  it('corrects only the problematic phrases while preserving the remaining sentence structure', () => {
    const content = 'Our platform delivers scalable analytics and is obviously 100% bug-free.';
    const result = analyzeContentSync(content, {
      name: 'DataPulse',
      companyName: 'DataPulse',
      industry: 'Technology and software',
      isGeneric: true,
    });

    expect(result.correctedContent).toContain('Our platform delivers scalable analytics');
    expect(result.correctedContent).not.toContain('obviously');
    expect(result.correctedContent).not.toContain('100% bug-free');
    expect(result.correctedContent).toContain('engineered for high reliability');
  });
});
