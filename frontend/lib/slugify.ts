const makeSlug = (text: string) => {
    const slug = text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/-+/g, "-"); // collapse dashes

    return slug;
};
export default makeSlug;
