// Generic publisher contract.
export interface AmqpPublisher<T> {
    publish(payload: T): Promise<void>
}