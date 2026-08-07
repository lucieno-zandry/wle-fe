export const dateStringToNumber = (dateString: string): number => {
    const date = new Date(dateString);
    return date.getTime();
}