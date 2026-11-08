"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Chip, Spinner, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useErrorHandler } from "@/helpers/errorsHandler";
import { getMessages } from "@/services/chat/getMessages";
import { sendMessage } from "@/services/chat/sendMessage";
import { ChatMessage } from "@/services/chat/types";
import { formatDateTime, senderRoleLabel } from "../format";

export default function ChatThreadDetail() {
  const params = useParams();
  const eventUuid = Array.isArray(params.event_uuid)
    ? params.event_uuid[0]
    : params.event_uuid ?? "";
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? "";
  const handleError = useErrorHandler();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [isSending, setSending] = useState(false);

  // Para hacer scroll al final cuando llegan mensajes nuevos.
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!token || !eventUuid) return;
    setLoading(true);
    try {
      const list = await getMessages(token, eventUuid);
      setMessages(list);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, eventUuid]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async () => {
    if (!token || !eventUuid) return;
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      const message = await sendMessage(token, eventUuid, value);
      setMessages((prev) => [...prev, message]);
      setText("");
    } catch (error) {
      handleError(error);
    } finally {
      setSending(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex w-full justify-center py-10">
        <Spinner label="Cargando conversacion..." />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-medium">Conversacion</h3>
        <span className="text-tiny text-default-500">Evento {eventUuid}</span>
      </div>

      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-medium border border-divider p-4">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-default-500">
            Todavia no hay mensajes en esta conversacion.
          </p>
        ) : (
          messages.map((message) => {
            const isAdmin = message.sender_role === "admin";
            return (
              <div
                key={message.uuid}
                className={`flex flex-col ${
                  isAdmin ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-medium px-4 py-2 ${
                    isAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-default-100"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-tiny font-medium">
                      {senderRoleLabel(message.sender_role)}
                    </span>
                    <Chip size="sm" variant="flat">
                      {message.original_language_code}
                    </Chip>
                  </div>
                  <p className="whitespace-pre-wrap text-small">
                    {message.original_text}
                  </p>
                </div>
                <span className="mt-1 text-tiny text-default-400">
                  {formatDateTime(message.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          variant="bordered"
          minRows={2}
          placeholder="Escribi tu respuesta..."
          value={text}
          onValueChange={setText}
        />
        <div className="flex justify-end">
          <Button
            color="primary"
            isLoading={isSending}
            isDisabled={isSending || text.trim().length === 0}
            endContent={
              !isSending && (
                <Icon icon="solar:plain-2-linear" width={18} />
              )
            }
            onPress={onSend}
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
