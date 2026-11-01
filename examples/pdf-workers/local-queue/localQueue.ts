export interface ReportJob {
    id: number;
    rowCount: number;
}


export class LocalQueue {

    private pending: ReportJob[] = [];
    private running = false;
    private idleWaiters: Array<() => void> = [];

    constructor(
        private readonly execute: (job: ReportJob) => Promise<void>
    ) { }

    add(job: ReportJob): void {
        this.pending.push(job);
        console.log(`Job ${job.id} queued`);
        this.runNext().catch(error => {
            console.error(`Error running job ${job.id}:`, error);
        });
    }

    private async runNext(): Promise<void> {
        if (this.running) return;

        const job = this.pending.shift();
        console.log(`Job ${job?.id} dequeued`);
        if (!job) {
            for (const resolve of this.idleWaiters.splice(0)) {
                resolve();
            }
            return;
        };

        this.running = true;

        try {
            console.log(`Job ${job.id} started`);
            await this.execute(job);
            console.log(`Job ${job.id} completed`);
        } catch (error) {
            console.error(`Job ${job.id} failed:`, error);
        } finally {
            this.running = false;
        }

        await this.runNext();

    }

    onIdle(): Promise<void> {

        if (!this.running && this.pending.length === 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.idleWaiters.push(resolve);
        })
    }
}