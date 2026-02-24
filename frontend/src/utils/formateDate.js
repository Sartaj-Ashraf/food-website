export const formatDate = (dateString) => {
    const formate = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", formate);
};
