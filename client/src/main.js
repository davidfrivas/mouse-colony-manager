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
  // Send the HTTP request to the specified route with method and headers
  const response = await fetch(`http://localhost:5000${route}`, {
    method: methodType, // HTTP method (POST, GET, etc.)
    headers: {
      'Content-Type': 'application/json' // Let server know we're sending JSON
    },
    body: JSON.stringify(data) // Convert JavaScript object to JSON string
  });

  // If the response status is 2xx (success), return the parsed JSON
  if (response.ok) {
    return await response.json();
  } else {
    // If the response is not successful, throw the parsed error JSON
    throw await response.json();
  }
}