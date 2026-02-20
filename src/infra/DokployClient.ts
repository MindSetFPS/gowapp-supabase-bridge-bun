const COMPOSE_FILE = `services:
  whatsapp:
    image: aldinokemal2104/go-whatsapp-web-multidevice:v7.11.1
    restart: always      -
    networks:
 dokploy-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whatsapp-{business_id}.rule=PathPrefix(\`/api/user/{business_id}\`)"
      - "traefik.http.routers.whatsapp-{business_id}.entrypoints=web"
      - "traefik.http.middlewares.strip-{business_id}.stripprefix.prefixes=/api/user/{business_id}"
      - "traefik.http.routers.whatsapp-{business_id}.middlewares=strip-{business_id}"
      - "traefik.http.services.whatsapp-{business_id}.loadbalancer.server.port=3000"
    command:
      - rest
      - --basic-auth=admin:admin
      - --webhook=http://192.168.1.64:5824/webhook/connected/{business_id}
      - --port=3000
      - --debug=true
      - --os=Chrome
      - --account-validation=false

networks:
  dokploy-network:
    external: true
`;

async function post<T>(serverUrl: string, apiKey: string, endpoint: string, payload: any): Promise<T> {
  const response = await fetch(`${serverUrl}/api/${endpoint}`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    const message = `Dokploy POST ${endpoint} failed with status ${response.status}: ${errorText}`;
    console.error(message);
    throw new Error(message);
  }
}

export async function updateContainerConfiguration(
  serverUrl: string,
  apiKey: string,
  composeId: string,
  businessId: number,
): Promise<any> {
  const composeFile = COMPOSE_FILE.replace(/{business_id}/g, businessId.toString());

  const env = `BUSINESS_ID=${businessId}
SUPABASE_URL=\${{project.SUPABASE_URL}}
SUPABASE_KEY=\${{project.SUPABASE_KEY}}
`;

  const payload = {
    composeId,
    composeFile,
    sourceType: "raw",
    env
  };

  return await post(serverUrl, apiKey, "compose.update", payload);
}
