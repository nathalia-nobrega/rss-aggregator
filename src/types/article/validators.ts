export function generateExcerpt(contentSnippet: string) {
    if (!contentSnippet) {
        return "No content snippet provided";
    }

    let excerpt = contentSnippet.slice(0, 200).trim();
    excerpt = excerpt.replaceAll("\n", "");
    return excerpt + "...";
}
