import type { ID } from "../types";

let counter = 0;

/**
 * Local id generator. `crypto.randomUUID` exists in every browser we target,
 * but falling back keeps the mock layer usable in non-secure contexts too.
 */
export function createId(prefix = "id"): ID {
  counter += 1;

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

let taskCounter = 100;

/** Sequential, human-readable task reference shown in the UI (`TF-104`). */
export function nextTaskNumber(): number {
  taskCounter += 1;
  return taskCounter;
}

export function seedTaskCounter(value: number): void {
  taskCounter = Math.max(taskCounter, value);
}
