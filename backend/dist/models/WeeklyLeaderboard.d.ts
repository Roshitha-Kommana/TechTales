import mongoose, { Document } from 'mongoose';
export interface IWeeklyLeaderboard extends Document {
    userId: mongoose.Types.ObjectId;
    weekStartDate: Date;
    weeklyPoints: number;
    quizzesCompleted: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare function getWeekStartDate(date?: Date): Date;
export declare const WeeklyLeaderboard: mongoose.Model<IWeeklyLeaderboard, {}, {}, {}, mongoose.Document<unknown, {}, IWeeklyLeaderboard, {}, {}> & IWeeklyLeaderboard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WeeklyLeaderboard.d.ts.map