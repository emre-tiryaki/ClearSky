import { getCategoryName } from "./categoryMapper";

export const WEIGHT_CATEGORY_CODES = [2, 3, 4, 5, 6, 7] as const;
export const TYPE_CATEGORY_CODES = [8, 9, 10, 11, 12, 14, 15, 16, 17] as const;

export interface CategoryOption {
    code: number;
    label: string;
}

export function buildCategoryOptions(codes: readonly number[]): CategoryOption[] {
    return codes.map(code => ({ code, label: getCategoryName(code) }));
}