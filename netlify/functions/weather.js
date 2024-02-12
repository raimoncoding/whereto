// Vereist node-fetch als je niet op de ingebouwde fetch van Netlify Functions vertrouwt
const fetch = require('node-fetch');

exports.handler = async function(event) {
    const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
    const city = event.queryStringParameters.city || 'Amsterdam'; // Standaard stad als voorbeeld

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Foutafhandeling als de API een fout teruggeeft
            return {
                statusCode: response.status,
                body: "Fout bij het ophalen van het weer"
            };
        }
        const data = await response.json(); // Parseer het JSON-antwoord

        return {
            statusCode: 200,
            body: JSON.stringify(data) // Stuur de data terug als een string
        };
    } catch (error) {
        // Vang netwerkfouten of andere onverwachte fouten
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Interne serverfout" })
        };
    }
};
