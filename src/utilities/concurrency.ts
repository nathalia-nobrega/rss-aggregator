export async function processWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results = new Array(items.length);

    let index = 0;

    async function worker() {
        // no race condition because
        // js is single-threaded
        // + post increment here prevents index 0 from being ignored!
        const currIndex = index++;

        const item = items[currIndex]!;

        try {
            results[currIndex] = await fn(item);
        } catch (err: any) {
            console.error("Worker error for item: ", item, err);
        }
    }

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        worker
    );
    // init all workers at once
    await Promise.all(workers);
    // Filter out undefined entries (failed items)
    return results.filter((r): r is R => r !== undefined);
}
