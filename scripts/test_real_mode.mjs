import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Testing Real Mode API endpoints...');

  // 1. Login
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@brandivemedsols.com',
      password: 'Password123!',
    }),
  });

  const cookie = loginRes.headers.get('set-cookie');
  if (!cookie) {
    throw new Error('Login failed: no cookie returned.');
  }
  const loginData = await loginRes.json();
  const workspaceId = loginData.workspaces[0].id;
  console.log('Logged in successfully. Workspace ID:', workspaceId);

  // 2. Test CSV Export
  const exportRes = await fetch(`http://localhost:3000/api/v1/workspaces/${workspaceId}/analytics/export`, {
    headers: { Cookie: cookie },
  });
  console.log('Export Status:', exportRes.status, exportRes.headers.get('content-type'));
  const csvText = await exportRes.text();
  console.log('Export CSV Preview (first 200 chars):\n', csvText.substring(0, 200));

  if (!csvText.includes('"Post_ID"')) {
    throw new Error('CSV Export header missing!');
  }

  // 3. Test Physical File Upload
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const postData = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test_pixel.png"\r\nContent-Type: image/png\r\n\r\n`),
    samplePngBuffer,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nPROMO\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="tags"\r\n\r\n["test","pixel"]\r\n`),
    Buffer.from(`--${boundary}--\r\n`),
  ]);

  const uploadRes = await fetch(`http://localhost:3000/api/v1/workspaces/${workspaceId}/assets/upload`, {
    method: 'POST',
    headers: {
      Cookie: cookie,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': postData.length.toString(),
    },
    body: postData,
  });

  console.log('Upload Status:', uploadRes.status);
  const uploadJson = await uploadRes.json();
  console.log('Upload Result:', uploadJson);

  if (!uploadJson.success || !uploadJson.asset.storageKey) {
    throw new Error('Upload verification failed!');
  }

  // 4. Test Scheduler Tick
  const tickRes = await fetch('http://localhost:3000/api/v1/scheduler/tick', {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const tickJson = await tickRes.json();
  console.log('Scheduler Tick Result:', tickJson);

  console.log('\nAll Real Mode verification tests passed cleanly!');
}

main().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
