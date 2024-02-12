exports.handler = async function(event, context) {
    const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
    // Je logica hier, bijvoorbeeld het aanroepen van een externe API met fetch
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hallo van Netlify Functions!" })
    };
};