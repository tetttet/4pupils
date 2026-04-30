"use client";

import * as React from "react";

import { fetchUserById, getCachedUserById } from "@/services/user";
import type { User } from "@/types/user";

const USER_IDS_KEY_SEPARATOR = "\u001f";

type UsersDirectoryState = {
  usersById: Record<string, User>;
  isPending: (id: string | null | undefined) => boolean;
};

function normalizeUserIds(userIds: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      userIds
        .map((value) => value?.trim() ?? "")
        .filter((value) => value.length > 0),
    ),
  );
}

function getCachedUsersById(userIds: string[]) {
  return userIds.reduce<Record<string, User>>((accumulator, id) => {
    const user = getCachedUserById(id);

    if (user) {
      accumulator[id] = user;
    }

    return accumulator;
  }, {});
}

function buildUserIdsKey(userIds: string[]) {
  return userIds.join(USER_IDS_KEY_SEPARATOR);
}

function readUserIdsKey(userIdsKey: string) {
  return userIdsKey.length > 0
    ? userIdsKey.split(USER_IDS_KEY_SEPARATOR)
    : [];
}

function addPendingIds(
  current: Record<string, true>,
  idsToLoad: string[],
) {
  let changed = false;
  const nextMap = { ...current };

  idsToLoad.forEach((id) => {
    if (!nextMap[id]) {
      nextMap[id] = true;
      changed = true;
    }
  });

  return changed ? nextMap : current;
}

function removePendingIds(
  current: Record<string, true>,
  idsToLoad: string[],
) {
  let changed = false;
  const nextMap = { ...current };

  idsToLoad.forEach((id) => {
    if (nextMap[id]) {
      delete nextMap[id];
      changed = true;
    }
  });

  return changed ? nextMap : current;
}

export function useUsersDirectoryState(
  userIds: Array<string | null | undefined>,
): UsersDirectoryState {
  const userIdsKey = buildUserIdsKey(normalizeUserIds(userIds));
  const uniqueUserIds = React.useMemo(
    () => readUserIdsKey(userIdsKey),
    [userIdsKey],
  );
  const [usersById, setUsersById] = React.useState<Record<string, User>>(() =>
    getCachedUsersById(uniqueUserIds),
  );
  const [pendingMap, setPendingMap] = React.useState<Record<string, true>>({});
  const requestedIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const cachedUsers = getCachedUsersById(uniqueUserIds);

    if (!Object.keys(cachedUsers).length) {
      return;
    }

    setUsersById((current) => {
      let changed = false;
      const nextUsers = { ...current };

      uniqueUserIds.forEach((id) => {
        const user = cachedUsers[id];

        if (user && nextUsers[id] !== user) {
          nextUsers[id] = user;
          changed = true;
        }
      });

      return changed ? nextUsers : current;
    });
  }, [uniqueUserIds]);

  React.useEffect(() => {
    const requestedIds = requestedIdsRef.current;
    const idsToLoad = uniqueUserIds.filter(
      (id) =>
        !requestedIds.has(id) &&
        !usersById[id] &&
        !getCachedUserById(id),
    );

    if (!idsToLoad.length) {
      return;
    }

    let cancelled = false;

    idsToLoad.forEach((id) => requestedIds.add(id));
    setPendingMap((current) => addPendingIds(current, idsToLoad));

    void Promise.allSettled(
      idsToLoad.map(async (id) => ({
        id,
        user: await fetchUserById(id),
      })),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextUsers: Record<string, User> = {};

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          nextUsers[result.value.id] = result.value.user;
          return;
        }

        const failedId = idsToLoad[index];
        if (failedId) {
          requestedIds.delete(failedId);
        }
      });

      if (Object.keys(nextUsers).length > 0) {
        setUsersById((current) => ({
          ...current,
          ...nextUsers,
        }));
      }

      setPendingMap((current) => removePendingIds(current, idsToLoad));
    });

    return () => {
      cancelled = true;
      idsToLoad.forEach((id) => requestedIds.delete(id));
      setPendingMap((current) => removePendingIds(current, idsToLoad));
    };
  }, [uniqueUserIds, usersById]);

  return React.useMemo(
    () => ({
      usersById,
      isPending: (id: string | null | undefined) => {
        const normalizedId = id?.trim() ?? "";
        return normalizedId.length > 0 && Boolean(pendingMap[normalizedId]);
      },
    }),
    [pendingMap, usersById],
  );
}

export function useUsersDirectory(userIds: Array<string | null | undefined>) {
  return useUsersDirectoryState(userIds).usersById;
}
