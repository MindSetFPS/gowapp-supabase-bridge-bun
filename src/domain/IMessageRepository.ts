import { IMessage } from '../domain/IMessage';

export interface IMessageWithSender {
  id: string;
  chat_id: string;
  sender_id: string;
  text_content: string | null;
  replied_to_message_id: string | undefined;
  quoted_message_text: string | undefined;
  created_at: Date;
}

export interface IMessageRepository {
  findById(id: string): Promise<IMessage | null>;
  save(message: Partial<IMessage>): Promise<IMessage>;
  findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]>;
}
