// Runs a task on a fixed polling interval until stopped.
// If the task returns a number, that value overrides the interval for the next cycle.
export class PollingScheduler {
    private isRunning = false;
    private timer: NodeJS.Timeout | null = null;

    constructor(
        private readonly intervalMs: number,
        private readonly task: () => Promise<number | void>,
    ) { }

    // Starts the polling loop if it is not already running.
    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        void this.tick();
    }

    // Stops the polling loop and clears any pending timer.
    stop(): void {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    // Executes one polling cycle and handles task failures safely.
    private async tick(): Promise<void> {
        if (!this.isRunning) return;

        let nextInterval = this.intervalMs;

        try {
            const result = await this.task();
            if (typeof result === 'number') {
                nextInterval = result;
            }
        } catch (error) {
            console.error("PollingScheduler: cycle is failed", error)
        }

        if (!this.isRunning) return;

        this.timer = setTimeout(() => {
            void this.tick();
        }, nextInterval);
    }
}