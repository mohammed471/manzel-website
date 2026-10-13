"use client";

import { useSyncExternalStore } from "react";
import { boardParam, parseBoard, toggleEntry, type BoardEntry } from "@/lib/board";

// The visitor's «لوحتي», kept in their own browser — no account and nothing on a
// server. Stored as the same text the link carries (see board.ts).
const STORAGE_KEY = "manzel-board";
const CHANGE_EVENT = "board-change";
const EMPTY: BoardEntry[] = [];

// Storage can be refused (private mode, in-app browsers): the board then lasts for the tab
let blocked = false;
let memory = "";
let lastRaw: string | null = null;
let lastEntries = EMPTY;

function read(): string {
  if (!blocked) {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      blocked = true;
    }
  }
  return memory;
}

// The same array until the stored text changes — useSyncExternalStore compares by identity
function snapshot(): BoardEntry[] {
  const raw = read();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastEntries = parseBoard(raw);
  }
  return lastEntries;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // Saved in another tab
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function writeBoard(entries: BoardEntry[]) {
  memory = boardParam(entries);
  if (!blocked) {
    try {
      localStorage.setItem(STORAGE_KEY, memory);
    } catch {
      blocked = true;
    }
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const toggleSaved = (entry: BoardEntry) => writeBoard(toggleEntry(snapshot(), entry));

/** The visitor's board — empty on the server and until hydration. */
export const useBoard = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);

const noSubscription = () => () => {};

/** False on the server and while hydrating — for UI that depends on what the browser has stored. */
export const useHydrated = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
