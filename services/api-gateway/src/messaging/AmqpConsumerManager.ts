import { connect, type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";

export type MessageHandler = (message: ConsumeMessage) => Promise<void>;

// Manages a single RabbitMQ queue: connects, binds to a topic exchange,
// and consumes messages with per-message ack/nack error handling.
export class AmqpConsumerManager {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;

    constructor(
        private readonly url: string,
        private readonly exchangeName: string,
        private readonly exchangeType: 'topic',
        private readonly queueName: string,
        private readonly routingPattern: string,
        private readonly prefetchCount: number,
    ) { }

    async connect(): Promise<void> {
        this.connection = await connect(this.url);
        this.channel = await this.connection.createChannel();
        await this.getChannel().prefetch(this.prefetchCount);

        await this.assertExchange();
        await this.assertQueue();
        await this.bindQueue(this.routingPattern);
    }

    // Consumes messages from the Amqp queue
    async consume(handler: MessageHandler): Promise<void> {
        const channel = this.getChannel();

        await channel.consume(this.queueName, msg => {
            if (!msg) return;

            void handler(msg)
                .then(() => this.ack(msg))
                .catch(error => {
                    console.error("AmqbConsumerManager: message processing failed", error);
                    this.nack(msg);
                });
        });
    }

    // Sends a nack signal to amqp, meaning that the message is not handled.
    private nack(msg: ConsumeMessage) {
        this.getChannel().nack(msg, false, false);
    }

    // Sends a ack signal to amqp, meaning that the message is handled and can be removed.
    private ack(msg: ConsumeMessage): void {
        this.getChannel().ack(msg);
    }

    // Binds the queue to exchange.
    private async bindQueue(routingPattern: string): Promise<void> {
        await this.getChannel().bindQueue(this.queueName, this.exchangeName, routingPattern);
    }

    // Asserts that if the queue is there or not.
    private async assertQueue(): Promise<void> {
        await this.getChannel().assertQueue(this.queueName, { durable: true });
    }

    // Asserts that if the exchange is there or not.
    private async assertExchange(): Promise<void> {
        await this.getChannel().assertExchange(this.exchangeName, this.exchangeType, { durable: true });
    }

    private getChannel(): Channel {
        if (!this.channel)
            throw new Error("AmqpConsumerManager: cant use getChannel before using connect()");

        return this.channel;
    }
}