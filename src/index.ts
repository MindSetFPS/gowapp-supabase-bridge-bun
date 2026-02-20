import { handleConnectionWebhook } from './routes/connection';
import { handleMessageWebhook } from './routes/messages';
import { IWebhookEvent } from './domain/IWebhookEvent';

const PORT = parseInt(process.env.PORT || '5824');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    const url = new URL(request.url);
    const webhookMatch = url.pathname.match(/^\/webhook\/([^/]+)$/);
    const webhookConnectedMatch = url.pathname.match(/^\/webhook\/connected\/([^/]+)$/);

    if (webhookMatch && request.method === 'POST') {
      const businessId = parseInt(webhookMatch[1]);

      return request
        .json()
        .then(async (body) => {
          return handleConnectionWebhook(businessId, body);
        })
        .catch((error) => {
          console.error('Error parsing webhook:', error);
          return new Response('Bad Request', { status: 400 });
        });
    }

    if (webhookConnectedMatch && request.method === 'POST') {
      const businessId = parseInt(webhookConnectedMatch[1]);

      return request
        .json()
        .then(async (body: IWebhookEvent) => {
          return handleMessageWebhook(businessId, body);
        })
        .catch((error) => {
          console.error('Error parsing webhook:', error);
          return new Response('Bad Request', { status: 400 });
        });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
