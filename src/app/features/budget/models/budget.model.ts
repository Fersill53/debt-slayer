export type BudgetExpenseType = 'fixed' | 'variable';

export type BudgetExpense = {
    id: string;
    name: string;
    amount: number;
    type: BudgetExpenseType;
};

export type Budget = {
    incomeMonthly: number;
    expenses: BudgetExpense[];
    updatedAt: string; // ISO datetime
};