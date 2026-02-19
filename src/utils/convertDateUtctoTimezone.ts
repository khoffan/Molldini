export const convertDateUtctoTimezone = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleDateString();
}