import { SupabaseClient } from '@supabase/supabase-js';
import { IMessage } from '../domain/IMessage';
import { IMessageRepository, IMessageWithSender } from '../domain/IMessageRepository';
import { Message } from '../domain/Message';
import { supabase } from './supabase';

export class SupabaseMessageRepository implements IMessageRepository {
  private _supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this._supabase = supabaseClient || supabase;
  }

  private mapToMessage(data: any): Message {
    return new Message(
      data.id,
      data.chat_id,
      data.sender_id,
      data.text_content,
      data.replied_to_message_id,
      data.quoted_message_text,
      new Date(data.created_at)
    );
  }

  async findById(id: string): Promise<IMessage | null> {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching message by ID:', error);
      throw error;
    }
    return data ? this.mapToMessage(data) : null;
  }

  async save(message: Partial<IMessage>): Promise<IMessage> {
    const messageData: any = {
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      text_content: message.text_content,
      replied_to_message_id: message.replied_to_message_id,
      quoted_message_text: message.quoted_message_text,
      created_at: message.created_at?.toISOString() || new Date().toISOString(),
    };

    const { data, error } = await this._supabase
      .from('messages')
      .upsert(messageData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    return this.mapToMessage(data);
  }

  async findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]> {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages by chat ID:', error);
      throw error;
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      text_content: msg.text_content,
      replied_to_message_id: msg.replied_to_message_id,
      quoted_message_text: msg.quoted_message_text,
      created_at: new Date(msg.created_at),
    }));
  }
}

export const messageRepository = new SupabaseMessageRepository();
