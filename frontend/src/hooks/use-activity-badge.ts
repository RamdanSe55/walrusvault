import { useCallback } from "react";
import { useGetActivityLogs, getGetActivityLogsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY_PREFIX = "walrusvault_last_activity_visit_";

function storageKey(walletAddress: string) {
  return `${STORAGE_KEY_PREFIX}${walletAddress}`;
}

function getLastVisit(walletAddress: string): number {
  const raw = localStorage.getItem(storageKey(walletAddress));
  return raw ? parseInt(raw, 10) : 0;
}

export function useActivityBadge(walletAddress: string | undefined) {
  const queryClient = useQueryClient();
  const addr = walletAddress || "";

  const { data } = useGetActivityLogs(addr, {
    query: {
      enabled: !!walletAddress,
      staleTime: 30_000,
      queryKey: getGetActivityLogsQueryKey(addr),
    },
  });

  const logs = data?.logs ?? [];
  const lastVisit = walletAddress ? getLastVisit(walletAddress) : 0;

  const newCount = logs.filter((log) => {
    return new Date(log.createdAt).getTime() > lastVisit;
  }).length;

  const markSeen = useCallback(() => {
    if (!walletAddress) return;
    localStorage.setItem(storageKey(walletAddress), String(Date.now()));
    queryClient.invalidateQueries({
      queryKey: getGetActivityLogsQueryKey(walletAddress),
    });
  }, [walletAddress, queryClient]);

  return { newCount, markSeen };
}
