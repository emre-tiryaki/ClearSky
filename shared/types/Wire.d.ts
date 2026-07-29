// Utility type that converts all Date fields to string.
// Used to represent the JSON-serialized shape of a model after it travels over the wire.
type DateToString<T> = T extends Date ? string : T;

export type Wire<T> = {
    [K in keyof T]: DateToString<T[K]>
}