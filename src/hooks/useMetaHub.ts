"use client";

import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getToken } from "@/lib/auth";

export type MetaStatus =
  | "NaoIniciada"
  | "EmAndamento"
  | "PendenteAprovacao"
  | "Concluido"
  | "AguardandoRetorno";

export interface MetaStatusChangedPayload {
  metaId:   string;
  topicoId: string;
  status:   MetaStatus;
}

export interface MetaCreatedPayload {
  id:              string;
  topicoId:        string;
  descricao:       string;
  status:          MetaStatus;
  documentUrl:     string | null;
  approverComment: string | null;
  createdAt:       string;
  updatedAt:       string;
}

interface UseMetaHubOptions {
  onMetaStatusChanged?: (payload: MetaStatusChangedPayload) => void;
  onMetaCreated?:       (payload: MetaCreatedPayload) => void;
}

export function useMetaHub({ onMetaStatusChanged, onMetaCreated }: UseMetaHubOptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  // Keep callbacks in refs so they never stale inside the effect
  const onStatusRef  = useRef(onMetaStatusChanged);
  const onCreatedRef = useRef(onMetaCreated);

  useEffect(() => { onStatusRef.current  = onMetaStatusChanged; }, [onMetaStatusChanged]);
  useEffect(() => { onCreatedRef.current = onMetaCreated; },      [onMetaCreated]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let destroyed = false;
    const hub = process.env.NEXT_PUBLIC_AUTH_API;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hub}/hubs/meta`, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("metaStatusChanged", (payload: MetaStatusChangedPayload) => {
      onStatusRef.current?.(payload);
    });

    connection.on("metaCreated", (payload: MetaCreatedPayload) => {
      onCreatedRef.current?.(payload);
    });

    connection.start()
      .then(() => {
        if (!destroyed) {
          console.log("[MetaHub] Connected");
          connectionRef.current = connection;
        } else {
          connection.stop().catch(() => {});
        }
      })
      .catch((err) => {
        if (!destroyed) console.error("[MetaHub] Connection failed:", err);
      });

    return () => {
      destroyed = true;
      connectionRef.current = null;
      connection.stop().catch(() => {});
    };
  }, []); // mount/unmount only — callbacks handled via refs
}
