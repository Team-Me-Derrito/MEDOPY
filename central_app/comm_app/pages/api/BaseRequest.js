import { BASE_URL, API_KEY } from '/public/constants/Database.js';

//Base code to send request to server backend in standard format
export async function postRequest(endpoint, message) {
    if (typeof(endpoint) != 'string') {
        throw new TypeError('Invalid endpoint of type ' + typeof(endpoint));
    }
    if (typeof(message) != 'object') {
        throw new TypeError('Invalid message of type ' + typeof(message));
    }

    try {
        const url = `${BASE_URL}/${endpoint}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
        const json = await response.json();
        console.log(url);
        console.log(json);
        return json;
    } catch (err) {
        console.log(err);
        if (err instanceof TypeError) {
            throw new Error('Unable to connect to database probably');
        }
        return null;
    }
}
