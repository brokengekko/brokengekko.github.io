// This code is designed for a serverless environment (like Vercel or Netlify).
// You would place this file in the `api` directory of your project.
// For example: /api/upscale.js

// We need to import 'form-data' to handle the multipart/form-data format
// that the Stability AI API expects. You'll need to add this to your project's dependencies.
// npm install form-data
import FormData from 'form-data';
import fetch from 'node-fetch'; // Use node-fetch for making requests in a Node.js environment

export default async function handler(request, response) {
  // We only want to handle POST requests to this endpoint
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // The Stability AI API key should be stored as an environment variable for security,
    // not hardcoded. The name 'STABILITY_API_KEY' is an example.
    const apiKey = 'sk-haoABoMCG6n7omBbo8lzyW8fmQZ01kCvFUvzgQbcjhE6vQI8';
    if (!apiKey) {
      throw new Error('API key is not configured on the server.');
    }

    // Create a new FormData instance to forward to the Stability AI API
    const formData = new FormData();

    // The request body from the frontend is a stream. We need to parse it.
    // This part can be tricky depending on the serverless provider.
    // The following is a common approach.
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // We need to find the boundary to parse the multipart form data from the frontend
    const boundary = request.headers['content-type'].split('boundary=')[1];
    
    // Manually parse the form data parts
    const parts = buffer.toString().split(`--${boundary}`);
    
    for (const part of parts) {
      if (part.includes('name="image"')) {
        const fileData = part.split('\r\n\r\n')[1].trim();
        const fileBuffer = Buffer.from(fileData, 'binary');
        formData.append('image', fileBuffer, { filename: 'upload.jpg' });
      }
      if (part.includes('name="prompt"')) {
        const prompt = part.split('\r\n\r\n')[1].trim();
        formData.append('prompt', prompt);
      }
    }
    
    formData.append('output_format', 'jpeg');

    // Make the actual API call to Stability AI from our secure server environment
    const stabilityResponse = await fetch(
      'https://api.stability.ai/v2beta/stable-image/upscale/conservative',
      {
        method: 'POST',
        headers: {
          ...formData.getHeaders(), // Pass the headers from our new FormData object
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*',
        },
        body: formData,
      }
    );

    // If the call to Stability AI wasn't successful, forward the error
    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      throw new Error(`Stability AI API Error: ${stabilityResponse.status} - ${errorText}`);
    }

    // If successful, stream the image data back to our frontend client
    const imageBuffer = await stabilityResponse.buffer();
    
    response.setHeader('Content-Type', 'image/jpeg');
    response.status(200).send(imageBuffer);

  } catch (error) {
    console.error('Error in serverless function:', error);
    response.status(500).send(error.message);
  }
}
