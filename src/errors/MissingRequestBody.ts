export class MissingRequestBody extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MissingRequestBody";
    }
}
