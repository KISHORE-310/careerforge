import { AIService } from './ai-service';

export class ATSAnalyzer {
  static async analyze(resumeContent: string, jobDescription: string) {
    const analysis = await AIService.generateInsight({
      type: 'ATS_SCAN',
      content: { resumeContent, jobDescription }
    });

    return {
      score: analysis.score || 0,
      missingKeywords: analysis.gaps || [],
      impactSuggestions: analysis.suggestions || [],
      formattingAlerts: []
    };
  }

  static async optimizeBullet(bulletPoint: string, targetJob: string) {
    return AIService.generateInsight({
      type: 'BULLET_REWRITE',
      content: { bulletPoint, targetJob }
    });
  }
}
