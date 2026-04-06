import { Request, Response } from 'express';
export declare const getLeaderboardController: (req: Request, res: Response) => Promise<void>;
export declare const resetWeeklyLeaderboard: (req: Request, res: Response) => Promise<void>;
export declare const addUserPoints: (userId: string, pointsToAdd: number) => Promise<void>;
//# sourceMappingURL=leaderboardController.d.ts.map