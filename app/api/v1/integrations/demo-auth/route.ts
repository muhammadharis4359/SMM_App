import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform') || 'META';
  const workspaceId = searchParams.get('workspaceId') || '';
  const state = searchParams.get('state') || '';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Authorize ${platform} | BranDive SocialFlow AI</title>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #080D1A;
          color: #F8FAFC;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .card {
          background: #0E1526;
          border: 1px solid #1E293B;
          border-radius: 12px;
          padding: 32px;
          max-width: 440px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .btn {
          display: block;
          width: 100%;
          background: #0E88D3;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          text-decoration: none;
        }
        .badge {
          background: rgba(236, 72, 153, 0.2);
          color: #F472B6;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          display: inline-block;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">[DEMO MODE OAUTH SIMULATION]</span>
        <h2 style="font-family: 'Lexend'; font-size: 1.3rem; margin-bottom: 8px;">Authorize ${platform} Access</h2>
        <p style="font-size: 0.85rem; color: #94A3B8; line-height: 1.5;">
          BranDive SocialFlow AI is requesting permission to manage publishing, view capabilities, and read post engagement.
        </p>
        <a class="btn" href="/api/v1/integrations/${platform.toLowerCase()}/callback?code=demo_code_${Date.now()}&state=${state}">
          Confirm & Authorize Account
        </a>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
