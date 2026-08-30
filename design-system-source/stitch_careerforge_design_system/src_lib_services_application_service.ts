import { AIService } from './ai-service';

export class ApplicationService {
  static async generateAsset(type: 'COVER_LETTER' | 'LINKEDIN' | 'EMAIL', context: { user: any, job: any }) {
    return AIService.generateInsight({
      type: 'ASSET_GENERATION',
      content: { assetType: type, ...context }
    });
  }
}
