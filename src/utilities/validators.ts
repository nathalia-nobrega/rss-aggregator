/**
 * Validates UUID format
 */
export function isValidIdParam(id: string) {
    const uuidPattern =
        /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/gm;
    return uuidPattern.test(id);
}
