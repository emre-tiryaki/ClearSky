import amqplib, { type Channel } from "amqplib";

export class AmqpConnectionManager {
    private connection: amqplib.ChannelModel | null = null;
    private channel: Channel | null = null;

    constructor(
        private readonly url: string,
        private readonly exchangeName: string,
        private readonly exchangeType: 'topic' = 'topic'
    ) {}

    async connect(): Promise<void> {
        this.connection = await amqplib.connect(this.url);
        this.channel = await this.connection.createChannel();
        await this.assertExchange();
    }

    getChannel(): Channel {
        if (!this.channel)
            throw new Error("AmqbConnectionManager: cant use getChannel before connect()");

        return this.channel;
    }

    async assertExchange(): Promise<void> {
        await this.getChannel().assertExchange(this.exchangeName, this.exchangeType, {durable: true});
    }
}