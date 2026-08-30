import { AIService } from './ai-service';

export class CareerCoachService {
  static async getAdvice(query: string, userProfile: any) {
    return AIService.generateInsight({
      type: 'CAREER_COACH_QUERY',
      content: { query, userProfile }
    });
  }

  static async analyzeMarketTrends(targetRole: string) {
    return AIService.generateInsight({
      type: 'MARKET_INTELLIGENCE',
      content: { targetRole }
    });
  }
}
