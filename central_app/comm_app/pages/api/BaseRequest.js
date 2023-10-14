import { BASE_URL, API_KEY } from '/public/constants/Database.js';

export async function postRequest(endpoint, message) {
    console.log(message)
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
            body: JSON.stringify()
        });
        const json = await response.json();
        return json;
    } catch (err) {
        console.log(err);
        return null;
    }
}
