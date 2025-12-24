export class InvalidJsonFormat extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidJsonFormat";
    }
}
