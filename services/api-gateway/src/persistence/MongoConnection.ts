import {Db, MongoClient, type ProxyOptions} from "mongodb";

export class MongoConnection {
    private client: MongoClient | null = null;
    private db: Db | null = null

    constructor(
        private readonly uri: string,
        private readonly dbName: string
    ) {}

    async connect(): Promise<Db> {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        return this.db;
    }

    getDb(): Db {
        if (!this.db)
            throw new Error('MongoConnection: cannot use getDb() before connect()');

        return this.db;
    }

    async close(): Promise<void> {
        await this.client?.close();
    }
}