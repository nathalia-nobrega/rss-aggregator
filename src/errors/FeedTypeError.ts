export class FeedTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FeedTypeError";
    }
}
