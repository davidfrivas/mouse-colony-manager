/**
 * Helper function to make an HTTP request using Fetch API.
 * Sends JSON data to a specified route on localhost:3001.
 *
 * @param {string} route - The backend route to call (e.g., '/login').
 * @param {object} data - The payload to send in the request body (default is empty object).
 * @param {string} methodType - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @returns {Promise<object>} - The parsed JSON response from the server if successful.
 * @throws {object} - The parsed JSON error response if the request fails.
 */
export async function fetchData(route = '', data = {}, methodType) {
  // Configure request options
  const requestOptions = {
    method: methodType,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Only add body for methods that support it (not GET or HEAD)
  if (methodType !== 'GET' && methodType !== 'HEAD') {
    requestOptions.body = JSON.stringify(data);
  }

  // Send the HTTP request to the specified route
  const response = await fetch(route, requestOptions);

  // If the response status is 2xx (success), return the parsed JSON
  if (response.ok) {
    // Check if response has content before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } else {
    // If the response is not successful, throw the parsed error JSON
    const text = await response.text();
    throw text ? JSON.parse(text) : { message: `HTTP ${response.status}: ${response.statusText}` };
  }
}