export async function getDevices(businessId: number, user: string, password: string): Promise<any> {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (user && password) {
    headers['Authorization'] = `Basic ${btoa(`${user}:${password}`)}`;
  }

  const response = await fetch(`${"http://192.168.1.64"}/api/user/${businessId}/app/devices`, {
    headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    const message = `Failed to get devices: ${response.status}: ${errorText}`;
    console.error(message);
    throw new Error(message);
  }
}
