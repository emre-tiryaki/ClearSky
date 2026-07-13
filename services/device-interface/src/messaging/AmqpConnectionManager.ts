import amqplib, { type Channel } from "amqplib";

// Manages the AMQP connection and channel lifecycle for the service.
export class AmqpConnectionManager {
    private connection: amqplib.ChannelModel | null = null;
    private channel: Channel | null = null;

    constructor(
        private readonly url: string,
        private readonly exchangeName: string,
        private readonly exchangeType: 'topic' = 'topic'
    ) {}

    // Opens the connection, creates a channel, and ensures the exchange exists.
    async connect(): Promise<void> {
        this.connection = await amqplib.connect(this.url);
        this.channel = await this.connection.createChannel();
        await this.assertExchange();
    }

    // Returns the active AMQP channel after connect() has been called.
    getChannel(): Channel {
        if (!this.channel)
            throw new Error("AmqbConnectionManager: cant use getChannel before connect()");

        return this.channel;
    }

    // Declares the exchange used for publishing messages.
    async assertExchange(): Promise<void> {
        await this.getChannel().assertExchange(this.exchangeName, this.exchangeType, {durable: true});
    }
}