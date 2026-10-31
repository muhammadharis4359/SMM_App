// Hostinger Web Hosting Node.js Entrypoint (Phusion Passenger / hPanel)
// Allows Next.js to boot cleanly in Hostinger Web Hosting Node.js environment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Server error handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
      .once('error', (err) => {
        console.error('Server failed to start:', err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> BranDive SocialFlow AI running on port ${port}`);
      });
  })
  .catch((err) => {
    console.error('Next.js failed to prepare:', err);
    process.exit(1);
  });
