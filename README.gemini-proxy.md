Quick setup: Gemini proxy (local)

Purpose
- Avoid exposing API keys in the browser. This simple Express proxy obtains an access
  token using a service account and forwards requests to the Generative Language API.

Steps
1. Create a Google Cloud service account, grant it access to the project, and download the JSON key.
2. Set the environment variable:
   - Linux / macOS: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
   - Windows (PowerShell): $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"
3. Install dependencies and run the proxy:
   - npm install express node-fetch google-auth-library
   - node server/gemini-proxy.js
4. Run your frontend dev server and ensure requests to /api/gemini are proxied to the proxy.

Security notes
- Do not commit service account keys to source control.
- For production, run the proxy in a secure environment (App Engine, Cloud Run) and restrict
  the service account as needed.
