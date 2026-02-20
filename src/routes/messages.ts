import { WebhookEvent, IWebhookEvent } from '../domain/IWebhookEvent';
import { Contact } from '../domain/Contact';
import { Message } from '../domain/Message';
import { contactRepository } from '../infra/SupabaseContactRepository';
import { messageRepository } from '../infra/SupabaseMessageRepository';

function formatConversationContext(messages: { sender_id: string; chat_id: string; text_content: string | null }[]): string {
  return [...messages]
    .map((m) => `${m.sender_id !== m.chat_id ? 'Me' : 'Customer'}: ${m.text_content || ''}`)
    .join('\n');
}

async function generateSuggestion(prompt: string): Promise<string | null> {
  const ollamaHost = process.env.OLLAMA_HOST;
  if (!ollamaHost) {
    console.log('OLLAMA_HOST not set, skipping suggestion generation');
    return null;
  }

  try {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `Context:\n${prompt}\n\nBased on the conversation above, provide ONE short, professional and helpful response suggestion that I (the service provider/agent) could send next. \nRules:\n- Max 10 words.\n- Respond in the same language as the customer.\n- Return ONLY a JSON object with a "suggestion" key. No explanation.\nExample: {"suggestion": "Sure, let me check"}`,
        format: 'json',
        stream: false,
        options: { temperature: 0.8 },
      }),
    });

    if (!response.ok) {
      console.error('Ollama request failed:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.response);
    return parsed.suggestion || null;
  } catch (error) {
    console.error('Failed to generate suggestion:', error);
    return null;
  }
}

async function getOrCreateChat(contact: Contact): Promise<{ id: string }> {
  return { id: contact.id!.toString() };
}

export async function handleMessageWebhook(businessId: number, body: IWebhookEvent): Promise<Response> {
  console.log(`Received webhook for business_id: ${businessId}`, body);

  const webhookEvent = new WebhookEvent(body);

  if (!webhookEvent.isMessage()) {
    return new Response(null, { status: 200 });
  }

  const messageData = webhookEvent.message;
  if (!messageData) {
    return new Response(null, { status: 200 });
  }

  let senderContact: Contact;
  let chatContact: Contact;

  if (webhookEvent.isSentByMe()) {
    senderContact = await contactRepository.getOrCreateContact(businessId, webhookEvent.sender_id!);
    chatContact = await contactRepository.getOrCreateContact(businessId, webhookEvent.chat_id!);
  } else {
    senderContact = await contactRepository.getOrCreateContact(businessId, webhookEvent.chat_id!);

    const messages = await messageRepository.findByChatIdWithSender(webhookEvent.chat_id!, 0, 10);
    const context = formatConversationContext(messages);
    const suggestion = await generateSuggestion(context);
    if (suggestion) {
      console.log('Generated suggestion:', suggestion);
    }

    chatContact = senderContact;
  }

  const chat = await getOrCreateChat(chatContact);

  const message = new Message(
    messageData.id!,
    chat.id,
    senderContact.id!.toString(),
    messageData.text || '',
    messageData.replied_id,
    messageData.quoted_message,
    new Date()
  );

  try {
    await messageRepository.save(message);
  } catch (error) {
    console.error({ 'Error saving message:': error, messageData });
  }

  return new Response(null, { status: 200 });
}
