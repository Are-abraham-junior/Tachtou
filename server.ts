import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper to resolve application base URL
  const getAppUrl = (req: express.Request) => {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/$/, "");
    }
    const host = req.get("host") || "localhost:3000";
    const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
    return `${protocol}://${host}`;
  };

  // Google OAuth URL generator
  app.get("/api/auth/google/url", (req, res) => {
    const appUrl = getAppUrl(req);
    const redirectUri = `${appUrl}/auth/google/callback`;
    const clientId =
      (req.query.clientId as string) ||
      process.env.GOOGLE_CLIENT_ID ||
      process.env.OAUTH_CLIENT_ID ||
      "";

    if (!clientId) {
      return res.status(400).json({
        error: "MISSING_CLIENT_ID",
        message: "Google Client ID non configuré.",
        redirectUri,
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl, redirectUri });
  });

  // Google OAuth Callback Handler
  const googleCallbackHandler: express.RequestHandler = async (req, res) => {
    const code = req.query.code as string;
    const appUrl = getAppUrl(req);
    const redirectUri = `${appUrl}/auth/google/callback`;
    const clientId =
      process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "";
    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "";

    if (!code) {
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GMAIL_AUTH_ERROR', error: 'Code d'autorisation manquant' }, '*');
                window.close();
              }
            </script>
            <p>Erreur d'authentification. Vous pouvez fermer cette fenêtre.</p>
          </body>
        </html>
      `);
      return;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || tokenData.error || "Échec de la récupération des jetons.");
      }

      // Fetch user profile info (email)
      let userEmail = "";
      if (tokenData.access_token) {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          userEmail = userData.email || "";
        }
      }

      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc;">
            <h2 style="color: #34d399;">Connexion Gmail réussie !</h2>
            <p>Compte connecté : <strong>${userEmail || 'Gmail User'}</strong></p>
            <p style="color: #94a3b8;">Fermeture automatique de la fenêtre...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GMAIL_AUTH_SUCCESS',
                  email: '${userEmail}',
                  accessToken: '${tokenData.access_token}',
                  refreshToken: '${tokenData.refresh_token || ""}',
                  expiresIn: ${tokenData.expires_in || 3600}
                }, '*');
                setTimeout(function() { window.close(); }, 1200);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("OAuth callback error:", err);
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc;">
            <h2 style="color: #f87171;">Échec de la connexion OAuth</h2>
            <p>${err?.message || 'Une erreur est survenue lors de la connexion.'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GMAIL_AUTH_ERROR', error: ${JSON.stringify(err?.message || 'Erreur inconnue')} }, '*');
              }
            </script>
          </body>
        </html>
      `);
    }
  };

  app.get("/auth/google/callback", googleCallbackHandler);
  app.get("/auth/google/callback/", googleCallbackHandler);

  // Send Email via Gmail API
  app.post("/api/gmail/send", async (req, res) => {
    const { toEmail, subject, body, accessToken, refreshToken } = req.body;

    if (!toEmail || !subject || !body) {
      return res.status(400).json({ error: "Champs requis manquants (toEmail, subject, body)." });
    }

    let activeAccessToken = accessToken;

    // Refresh token if needed
    if (!activeAccessToken && refreshToken) {
      try {
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "",
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          }),
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.access_token) {
          activeAccessToken = refreshData.access_token;
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    if (!activeAccessToken) {
      return res.status(401).json({
        error: "NO_ACCESS_TOKEN",
        message: "Veuillez vous connecter à votre compte Gmail via OAuth pour autoriser l'envoi d'e-mails.",
      });
    }

    try {
      // Construct MIME Message
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
      const messageParts = [
        `From: me`,
        `To: ${toEmail}`,
        `Subject: ${utf8Subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        body,
      ];
      const messageText = messageParts.join("\r\n");

      // Base64URL encoding
      const rawMessage = Buffer.from(messageText)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const gmailResponse = await fetch("https://gmail.googleapis.com/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawMessage }),
      });

      const gmailData = await gmailResponse.json();

      if (!gmailResponse.ok) {
        throw new Error(gmailData?.error?.message || "Erreur de l'API Gmail lors de l'envoi.");
      }

      res.json({
        success: true,
        messageId: gmailData.id,
        threadId: gmailData.threadId,
        sentTo: toEmail,
      });
    } catch (err: any) {
      console.error("Gmail send error:", err);
      res.status(500).json({
        success: false,
        error: err?.message || "Échec de l'envoi de l'e-mail via Gmail.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
