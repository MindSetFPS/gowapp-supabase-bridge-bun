import { getDevices } from '../get-devices';
import { updateContainerConfiguration } from '../infra/DokployClient';
import { supabase } from '../infra/supabase';

interface ConnectionWebhookBody {
  redeployUrl?: string;
}

export async function handleConnectionWebhook(businessId: number, body: ConnectionWebhookBody): Promise<Response> {
  console.log(`Received connection webhook for business_id: ${businessId}`);
  try {
    const devices = await getDevices(businessId, "admin", "admin");

    let composeId;

    const { data: existingContainer } = await supabase.from('whatsapp-containers').select('container_id').eq('business_id', businessId).single();
    if (existingContainer && existingContainer.container_id) {
      composeId = existingContainer.container_id;
    }

    // update container so that is has new endpoint
    updateContainerConfiguration("http://192.168.1.64:3000", process.env.DOKPLOY_API_KEY!, composeId, businessId)

    // if it goes well, update the container configuration in the database to "connected"
    const { error: containerConfigError } = await supabase.from('whatsapp-containers').update({ status: 'connected' }).eq('business_id', businessId);
  } catch (error) {
    console.error('Error updating container configuration:', error);

    // if goes wrong, update the container configuration in the database to "error"
    const { data } = await supabase.from('whatsapp-containers').update({ status: 'error' }).eq('business_id', businessId);
  }

  if (body.redeployUrl) {
    try {
      await fetch(body.redeployUrl, { method: 'POST' });
      console.log(`Called redeployUrl for business_id: ${businessId}`);
    } catch (err) {
      console.error('Error calling redeployUrl:', err);
    }
  }

  return new Response(null, { status: 200 });
}
