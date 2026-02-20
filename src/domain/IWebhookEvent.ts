export interface IMessageAckPayload {
  chat_id: string;
  from: string;
  ids: string[];
  receipt_type: string;
  receipt_type_description: string;
  sender_id: string;
}

export interface IMessageContent {
  text: string;
  id: string;
  replied_id: string;
  quoted_message: string;
}

export interface IWebhookEvent {
  event?: 'message.ack' | string;
  payload?: IMessageAckPayload;
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname: string | null;
  sender_id?: string;
  timestamp: string;
}

export class WebhookEvent implements IWebhookEvent {
  event?: 'message.ack' | string;
  payload?: IMessageAckPayload;
  chat_id?: string;
  from?: string;
  message?: IMessageContent;
  pushname: string | null;
  sender_id?: string;
  timestamp: string;

  constructor(data: IWebhookEvent) {
    this.event = data.event;
    this.payload = data.payload;
    this.chat_id = data.chat_id;
    this.from = data.from;
    this.message = data.message;
    this.pushname = data.pushname;
    this.sender_id = data.sender_id;
    this.timestamp = data.timestamp;
  }

  isSentByMe(): boolean {
    return this.sender_id !== this.chat_id;
  }

  isSentByCustomer(): boolean {
    return this.sender_id == this.chat_id;
  }

  isAck(): boolean {
    return this.event === 'message.ack';
  }

  isMessage(): boolean {
    return !!this.message;
  }

  isGroup(): boolean | undefined {
    if (!this.from || !this.sender_id) {
      return undefined;
    }
    return !this.from.includes(this.sender_id);
  }
}
