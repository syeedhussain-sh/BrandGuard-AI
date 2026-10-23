import { describe, it, expect } from 'vitest';
import {
  analyzeBrandCompliance,
  analyzeContent,
  DEMO_BRAND_PROFILE,
  BrandProfile,
} from '../src/index.js';

describe('Universal Multi-Industry Brand Governance Engine Tests', () => {
  describe('Mode A: Configured Brand (NovaTech)', () => {
    it('applies configured official guidelines for NovaTech (DEMO_BRAND_PROFILE)', async () => {
      const content =
        'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';
      const res = await analyzeContent(content, DEMO_BRAND_PROFILE);

      expect(res.success).toBe(true);
      expect(res.governanceMode).toBe('configured');
      expect(res.officialGuidelinesConfigured).toBe(true);
      expect(res.analysisMode).toBe('rules');

      // Specifically uses NovaTech preferred terminology
      const termIssue = res.issues.find((i) => i.category === 'terminology');
      expect(termIssue?.matchedText).toBe('Nova Cloud');
      expect(termIssue?.suggestion).toBe('NovaTech Cloud Platform');
      expect(res.correctedContent).toContain('NovaTech Cloud Platform');
    });
  });

  describe('Mode B: Universal Generic Brand Analysis for Unconfigured Companies', () => {
    it('analyzes Automotive content (Tata Motors) without borrowing NovaTech rules', async () => {
      const input = {
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Our new tata motors electric SUV is 100% crash-proof and never needs maintenance. We guarantee 100% customer satisfaction.',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.success).toBe(true);
      expect(res.governanceMode).toBe('generic');
      expect(res.officialGuidelinesConfigured).toBe(false);
      expect(res.companyName).toBe('Tata Motors');
      expect(res.industry).toBe('Automotive');
      expect(res.modeLabel).toContain('Generic Brand Analysis — Official Brand Guidelines Not Configured');

      // CRITICAL: Must NEVER check or require "NovaTech" or flag Nova Cloud!
      const novaIssue = res.issues.find((i) =>
        i.matchedText.includes('NovaTech') || i.explanation.includes('NovaTech')
      );
      expect(novaIssue).toBeUndefined();

      // Should detect brand name casing ("tata motors" -> "Tata Motors")
      const casingIssue = res.issues.find((i) => i.matchedText === 'tata motors');
      expect(casingIssue).toBeDefined();
      expect(casingIssue?.suggestion).toBe('Tata Motors');

      // Should detect automotive risk indicator: "100% crash-proof"
      const crashIssue = res.issues.find((i) => i.matchedText === '100% crash-proof');
      expect(crashIssue).toBeDefined();
      expect(crashIssue?.severity).toBe('high');
      expect(crashIssue?.explanation).toContain('Automotive Risk Indicator');

      // Should detect "never needs maintenance"
      const maintIssue = res.issues.find((i) => i.matchedText === 'never needs maintenance');
      expect(maintIssue).toBeDefined();

      // Corrected content applies suggestions
      expect(res.correctedContent).toContain('Tata Motors');
      expect(res.correctedContent).not.toContain('100% crash-proof');
    });

    it('analyzes Mobile & Electronics content (Samsung) with electronics risk indicators', async () => {
      const input = {
        companyName: 'Samsung',
        industry: 'Mobile phones and electronics',
        content: 'The new samsung Galaxy features infinite battery life and an unbreakable screen with zero latency guaranteed.',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');
      expect(res.companyName).toBe('Samsung');

      // Casing check for "samsung"
      const casingIssue = res.issues.find((i) => i.matchedText === 'samsung');
      expect(casingIssue?.suggestion).toBe('Samsung');

      // Electronics risk indicator: "infinite battery life"
      const batteryIssue = res.issues.find((i) => i.matchedText === 'infinite battery life');
      expect(batteryIssue).toBeDefined();
      expect(batteryIssue?.explanation).toContain('Electronics Risk Indicator');

      // Electronics risk indicator: "unbreakable screen"
      const screenIssue = res.issues.find((i) => i.matchedText === 'unbreakable screen');
      expect(screenIssue).toBeDefined();

      // Zero latency indicator
      const latencyIssue = res.issues.find((i) => i.matchedText.includes('zero latency'));
      expect(latencyIssue).toBeDefined();
    });

    it('analyzes Food & Restaurant content (McDonald\'s) with food health indicators', async () => {
      const input = {
        companyName: "McDonald's",
        industry: 'Food and beverages',
        content: "Try mcdonald's miracle detox burger that cures all diseases and guarantees weight loss! Obviously it is the cheapest in the world.",
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');

      // Food risk indicator: "cures all diseases"
      const diseaseIssue = res.issues.find((i) => i.matchedText.includes('cures all diseases'));
      expect(diseaseIssue).toBeDefined();
      expect(diseaseIssue?.severity).toBe('high');
      expect(diseaseIssue?.explanation).toContain('Food & Beverage Risk Indicator');

      // Food risk indicator: "miracle detox"
      const detoxIssue = res.issues.find((i) => i.matchedText.includes('miracle detox'));
      expect(detoxIssue).toBeDefined();

      // Tone issue: "obviously"
      const toneIssue = res.issues.find((i) => i.matchedText.toLowerCase() === 'obviously');
      expect(toneIssue).toBeDefined();

      // Superlative: "cheapest in the world"
      const priceIssue = res.issues.find((i) => i.matchedText.includes('cheapest in the world'));
      expect(priceIssue).toBeDefined();
    });

    it('analyzes Clothing and Fashion content (Nike)', async () => {
      const input = {
        companyName: 'Nike',
        industry: 'Clothing and fashion',
        content: 'Our new nike running shoes are 100% eco-friendly on earth with cheapest prices guaranteed anywhere! BUY NOW TODAY DO NOT MISS OUT!!!',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');
      expect(res.companyName).toBe('Nike');

      // Retail risk indicator: "100% eco-friendly on earth"
      const ecoIssue = res.issues.find((i) => i.matchedText.includes('100% eco-friendly'));
      expect(ecoIssue).toBeDefined();

      // Aggressive punctuation: "!!!"
      const exclIssue = res.issues.find((i) => i.matchedText === '!!!');
      expect(exclIssue).toBeDefined();

      // Consecutive all-caps: "BUY NOW TODAY DO NOT MISS OUT"
      const capsIssue = res.issues.find((i) => i.category === 'tone' && i.explanation.toLowerCase().includes('all-caps'));
      expect(capsIssue).toBeDefined();
    });

    it('analyzes Technology and IT Services content (Infosys)', async () => {
      const input = {
        companyName: 'Infosys',
        industry: 'Technology and software',
        content: 'infosys provides 100% unhackable digital transformation with zero downtime guaranteed forever.',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');
      expect(res.companyName).toBe('Infosys');

      // Tech risk indicator: "100% unhackable"
      const hackIssue = res.issues.find((i) => i.matchedText.includes('100% unhackable'));
      expect(hackIssue).toBeDefined();
      expect(hackIssue?.explanation).toContain('Technology Risk Indicator');

      // Tech risk indicator: "zero downtime guaranteed forever"
      const downtimeIssue = res.issues.find((i) => i.matchedText.includes('zero downtime guaranteed forever'));
      expect(downtimeIssue).toBeDefined();
    });

    it('analyzes an entirely fictional company and user-defined industry', async () => {
      const input = {
        companyName: 'Nebula AeroVenture',
        industry: 'Commercial Space Tourism',
        content: 'Nebula AeroVenture guarantees 100% risk-free suborbital flights. Our rocket never fails and is total perfection.',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');
      expect(res.companyName).toBe('Nebula AeroVenture');
      expect(res.industry).toBe('Commercial Space Tourism');

      // Flags generic risk rules: 100% risk-free, never fails, total perfection
      expect(res.summary.totalIssues).toBeGreaterThanOrEqual(3);
      expect(res.summary.high).toBeGreaterThanOrEqual(2);
      expect(res.disclaimer).toBeDefined();
    });

    it('analyzes unconfigured company from unlisted industry', async () => {
      const input = {
        companyName: 'TimberCraft Studios',
        industry: 'Handmade Artisan Carpentry',
        content: 'We offer the cheapest in the market wooden tables that are 100% perfect. Obviously you will love them.',
      };

      const res = analyzeBrandCompliance(input);

      expect(res.governanceMode).toBe('generic');
      expect(res.summary.totalIssues).toBeGreaterThanOrEqual(3);
    });

    it('handles empty content gracefully', () => {
      const res = analyzeBrandCompliance({
        companyName: 'AnyCompany',
        content: '   ',
      });

      expect(res.success).toBe(true);
      expect(res.summary.totalIssues).toBe(0);
      expect(res.issues.length).toBe(0);
      expect(res.correctedContent).toBe('');
    });
  });
});
