/**
 * Helper function to make an HTTP request using Fetch API.
 * Sends JSON data to a specified route on localhost:5000.
 *
 * @param {string} route - The backend route to call (e.g., '/login').
 * @param {object} data - The payload to send in the request body (default is empty object).
 * @param {string} methodType - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @returns {Promise<object>} - The parsed JSON response from the server if successful.
 * @throws {object} - The parsed JSON error response if the request fails.
 */
export async function fetchData(route = '', data = {}, methodType) {
  const response = await fetch(route, {
    method: methodType,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    // Check if response has content before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } else {
    // Handle error responses that might be empty
    const text = await response.text();
    throw text ? JSON.parse(text) : { message: `HTTP ${response.status}: ${response.statusText}` };
  }
}