# Setting up Google OAuth with Supabase

To enable "Login with Google", you need to configure both the Google Cloud Console and your Supabase project. Follow these steps carefully.

## Step 1: Google Cloud Console Configuration

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a New Project** (or select an existing one):
    *   Click on the project dropdown at the top left.
    *   Click **New Project**.
    *   Name it (e.g., "SMESlab Auth") and click **Create**.
3.  **Configure OAuth Consent Screen**:
    *   In the search bar, type "OAuth consent screen" and select it.
    *   Select **External** (unless you are in a Google Workspace organization) and click **Create**.
    *   **App Information**: Fill in "App name" (e.g., SME Lab), "User support email", and "Developer contact information".
    *   **Scopes**: Click "Add or Remove Scopes" -> Select `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Click **Update** then **Save and Continue**.
    *   **Test Users**: Add your own email address to test the login while in "Testing" mode. Click **Save and Continue**.
4.  **Create Credentials**:
    *   Go to **Credentials** (left sidebar).
    *   Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
    *   **Application type**: Select **Web application**.
    *   **Name**: "Supabase Client".
    *   **Authorized JavaScript origins**: Add `https://<your-project-ref>.supabase.co` (You can find this URL in Supabase Dashboard -> Settings -> API).
    *   **Authorized redirect URIs**: Add `https://<your-project-ref>.supabase.co/auth/v1/callback`.
    *   Click **Create**.
5.  **Copy Keys**:
    *   A modal will appear with your **Client ID** and **Client Secret**. Keep these open or copy them.

## Step 2: Supabase Configuration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to **Authentication** (left sidebar) -> **Providers**.
4.  Find **Google** and click to expand/enable it.
5.  **Google Enabled**: Toggle to ON.
6.  **Client ID**: Paste the Client ID from Google Cloud.
7.  **Client Secret**: Paste the Client Secret from Google Cloud.
8.  Click **Save**.

## Step 3: Run the Application

Once completed, the "Login with Google" button in your application will function correctly.

> **Note**: If testing locally with `localhost`, you also need to add your localhost URL to the Google Cloud "Authorized JavaScript origins" (e.g., `http://localhost:5173`) and "Authorized redirect URIs" (e.g., `http://localhost:5173`) though Supabase handles the redirection mostly via its own callback.
