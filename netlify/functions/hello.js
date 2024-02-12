// netlify/functions/hello.js
exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hallo wereld van Netlify Functions!" })
    };
};
