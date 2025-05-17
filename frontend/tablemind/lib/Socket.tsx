"use client";
import { useEffect, useState } from "react";

export default function Socket_data({
  initialMessage,
}: {
  initialMessage: string;
}) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    const socket = new WebSocket("ws://0.0.0.0:8000/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data.message);
    };

    return () => socket.close();
  }, []);

  return <p className="text-xl mt-4">{message}</p>;
}
