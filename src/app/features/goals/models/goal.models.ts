export type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: string;
    savedSoFar: number;
    category: 'trip' | 'bill' | 'repair' | 'gift' | 'other';
};