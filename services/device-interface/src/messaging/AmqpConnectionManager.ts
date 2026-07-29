import amqplib, { type Channel } from "amqplib";

// Manages the AMQP connection and channel lifecycle for the service.
// Handles automatic reconnection with a retry loop on connection loss.
export class AmqpConnectionManager {
    private connection: amqplib.ChannelModel | null = null;
    private channel: Channel | null = null;
    private reconnecting: boolean = false;

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

        this.connection.on('error', err => {
            console.error('AmqpConnectionManager: connection error', err);
            void this.scheduleReconnect();
        })

        this.connection.on('close', () => {
            console.error('AmqpConnectionManager: connection closed...');
            void this.scheduleReconnect();
        })
    }
    
    // Returns the active AMQP channel after connect() has been called.
    getChannel(): Channel {
        if (!this.channel)
            throw new Error("AmqpConnectionManager: cant use getChannel before connect()");
        
        return this.channel;
    }

    publishJson(exchange: string, routingKey: string, payload: unknown, persistent = true): void {
        this.getChannel().publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(payload)),
            { contentType: 'application/json', persistent }
        );
    }
    
    // Declares the exchange used for publishing messages.
    async assertExchange(): Promise<void> {
        await this.getChannel().assertExchange(
            this.exchangeName, 
            this.exchangeType, 
            {durable: true}
        );
    }

    // Schedules a connection when the connection is lost for some reason.
    private async scheduleReconnect(): Promise<void> {
        if (this.reconnecting) return;

        this.reconnecting = true;
        this.channel = null;

        while(true) {
            try {
                await new Promise(resolve => setTimeout(resolve, 5000));
                console.log(`AmqpConnectionManager: attempting to reconnect...`);
                await this.connect();
                console.log('AmqpConnectionManager: reconnected succesfully');
                this.reconnecting = false;
                return;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`AmqpConnectionManager: reconnect failed, retrying in 5 s... (${message})`);
            }
        }
    }
}