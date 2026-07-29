type DateToString<T> = T extends Date ? string : T;

export type Wire<T> = {
    [K in keyof T]: DateToString<T[K]>
}