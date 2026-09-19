CREATE UNIQUE INDEX IF NOT EXISTS messages_conversation_client_message_key
  ON public.messages (conversation_id, client_message_id);