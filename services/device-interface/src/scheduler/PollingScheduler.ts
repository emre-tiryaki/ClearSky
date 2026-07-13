// Runs a task on a fixed polling interval until stopped.
export class PollingScheduler {
    private isRunning = false;
    private timer: NodeJS.Timeout | null = null;

    constructor(
        private readonly intervalMs: number,
        private readonly task: () => Promise<void>,
    ) {}

    // Starts the polling loop if it is not already running.
    start(): void {
        if(this.isRunning) return;

        this.isRunning = true;
        void this.tick();
    }

    // Stops the polling loop and clears any pending timer.
    stop(): void {
        this.isRunning = false;
        if(this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    // Executes one polling cycle and handles task failures safely.
    private async tick(): Promise<void> {
        if(!this.isRunning) return;

        // TODO: make this something professional.
        try {
            await this.task();
        } catch(error) {
            console.log("PollingScheduler: cycle is failed", error)
        }

        if (!this.isRunning) return;

        this.timer = setTimeout(() => {
            void this.tick();
        }, this.intervalMs);
    }
}