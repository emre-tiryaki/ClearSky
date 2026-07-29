// Generic publisher interface.
export interface AmqpPublisher<T> {
    publish(payload: T): Promise<void>
}