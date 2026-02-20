export interface IMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  text_content: string | null;
  replied_to_message_id: string | undefined;
  quoted_message_text: string | undefined;
  created_at: Date;
}
