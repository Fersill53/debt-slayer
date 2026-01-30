export type Debt = {
    id: string;
    name: string;
    balance: number;
    apr: number;
    minPayment: number;
    dueDay?: number;
}