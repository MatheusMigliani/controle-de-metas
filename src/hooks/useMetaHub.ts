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

export interface TopicoDocumentoPayload {
  id:         string;
  topicoId:   string;
  nome:       string;
  driveUrl:   string;
  uploadedAt: string;
}

export interface TopicoDocumentoRemovedPayload {
  topicoId: string;
  docId:    string;
}

interface UseMetaHubOptions {
  onMetaStatusChanged?:     (payload: MetaStatusChangedPayload) => void;
  onMetaCreated?:           (payload: MetaCreatedPayload) => void;
  onTopicoDocumentAdded?:   (payload: TopicoDocumentoPayload) => void;
  onTopicoDocumentRemoved?: (payload: TopicoDocumentoRemovedPayload) => void;
}

// Module-level variables to share connection across remounts (fixes double/triple /negotiate in dev)
let globalConnection: signalR.HubConnection | null = null;
let subscribers = 0;
let disconnectTimeout: NodeJS.Timeout | null = null;

export function useMetaHub({
  onMetaStatusChanged,
  onMetaCreated,
  onTopicoDocumentAdded,
  onTopicoDocumentRemoved,
}: UseMetaHubOptions) {
  // Keep callbacks in refs so they never stale inside the effect
  const onStatusRef          = useRef(onMetaStatusChanged);
  const onCreatedRef         = useRef(onMetaCreated);
  const onDocAddedRef        = useRef(onTopicoDocumentAdded);
  const onDocRemovedRef      = useRef(onTopicoDocumentRemoved);

  useEffect(() => { onStatusRef.current     = onMetaStatusChanged;     }, [onMetaStatusChanged]);
  useEffect(() => { onCreatedRef.current    = onMetaCreated;           }, [onMetaCreated]);
  useEffect(() => { onDocAddedRef.current   = onTopicoDocumentAdded;   }, [onTopicoDocumentAdded]);
  useEffect(() => { onDocRemovedRef.current = onTopicoDocumentRemoved; }, [onTopicoDocumentRemoved]);

  useEffect(() => {
    subscribers++;

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    if (!globalConnection) {
      const token = getToken();
      if (!token) return;

      const hub = process.env.NEXT_PUBLIC_AUTH_API;
      globalConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${hub}/hubs/meta`, { accessTokenFactory: () => getToken() ?? "" })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      globalConnection.start()
        .then(() => console.log("[MetaHub] Connected to SignalR"))
        .catch(err => console.error("[MetaHub] Connection failed:", err));
    }

    const handleStatus     = (p: MetaStatusChangedPayload)      => onStatusRef.current?.(p);
    const handleCreated    = (p: MetaCreatedPayload)             => onCreatedRef.current?.(p);
    const handleDocAdded   = (p: TopicoDocumentoPayload)         => onDocAddedRef.current?.(p);
    const handleDocRemoved = (p: TopicoDocumentoRemovedPayload)  => onDocRemovedRef.current?.(p);

    globalConnection.on("metaStatusChanged",    handleStatus);
    globalConnection.on("metaCreated",          handleCreated);
    globalConnection.on("topicoDocumentAdded",  handleDocAdded);
    globalConnection.on("topicoDocumentRemoved", handleDocRemoved);

    return () => {
      if (globalConnection) {
        globalConnection.off("metaStatusChanged",    handleStatus);
        globalConnection.off("metaCreated",          handleCreated);
        globalConnection.off("topicoDocumentAdded",  handleDocAdded);
        globalConnection.off("topicoDocumentRemoved", handleDocRemoved);
      }

      subscribers--;
      if (subscribers === 0) {
        disconnectTimeout = setTimeout(() => {
          if (subscribers === 0 && globalConnection) {
            globalConnection.stop().catch(() => {});
            globalConnection = null;
            console.log("[MetaHub] Disconnected");
          }
        }, 1000);
      }
    };
  }, []);
}
