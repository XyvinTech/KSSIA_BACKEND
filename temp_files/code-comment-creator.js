// Create a function to generate a comment header separator
function createCommentHeader(title) {
    const lineLength = 100;
    const separator = '/*' + '*'.repeat(lineLength - 2) + '*/\n';
    const padding = (lineLength - 4 - title.length) / 2;
    const paddedTitle = ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding));

    return separator + '/*' + paddedTitle + '*/\n' + separator;
}

// Example usage
console.log(createCommentHeader
    (
        "Function to update status of payments"
    ));