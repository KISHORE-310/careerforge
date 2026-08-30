import { AIService } from './ai-service';

export class MatchEngine {
  static async calculateFit(userProfile: any, jobListing: any) {
    const skillScore = this.compareSkills(userProfile.skills, jobListing.requirements);
    const expScore = userProfile.experienceLevel === jobListing.level ? 100 : 70;
    
    return {
      overall: Math.round((skillScore + expScore) / 2),
      breakdown: {
        skills: skillScore,
        experience: expScore
      }
    };
  }

  private static compareSkills(user: string[], reqs: string[]) {
    const matched = user.filter(s => reqs.includes(s));
    return (matched.length / reqs.length) * 100;
  }
}