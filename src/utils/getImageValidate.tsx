export const getImageValidate = (url: string | null | undefined) => {
    if (!url || url.trim() === '') {
        return "https://placehold.co/400x500/png?text=No+Image";
    }
    return url;
}