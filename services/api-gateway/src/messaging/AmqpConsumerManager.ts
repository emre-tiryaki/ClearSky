import { connect, type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";

export type MessageHandler = (message: ConsumeMessage) => Promise<void>;

export class AmqpConsumerManager {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;

    constructor(
        private readonly url: string,
        private readonly exchangeName: string,
        private readonly exchangeType: 'topic',
        private readonly queueName: string,
        private readonly routintPattern: string,
        private readonly prefetchCount: number,
    ) { }

    async connect(): Promise<void> {
        this.connection = await connect(this.url);
        this.channel = await this.connection.createChannel();
        await this.getChannel().prefetch(this.prefetchCount);

        await this.assertExchange();
        await this.assertQueue();
        await this.bindQueue(this.routintPattern);
    }

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
    private nack(msg: ConsumeMessage) {
        this.getChannel().nack(msg, false, false);
    }

    private ack(msg: ConsumeMessage): any {
        this.getChannel().ack(msg);
    }

    private async bindQueue(routintPattern: string): Promise<void> {
        await this.getChannel().bindQueue(this.queueName, this.exchangeName, routintPattern);
    }

    private async assertQueue(): Promise<void> {
        await this.getChannel().assertQueue(this.queueName, { durable: true });
    }

    private async assertExchange(): Promise<void> {
        await this.getChannel().assertExchange(this.exchangeName, this.exchangeType, { durable: true });
    }

    private getChannel(): Channel {
        if (!this.channel)
            throw new Error("AmqpConsumerManager: cant use getChannel before using connect()");

        return this.channel;
    }
}