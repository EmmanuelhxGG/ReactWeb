import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as storage from "../../src/utils/storage";

// Simular localStorage para evitar tocar el almacenamiento real
describe("storage helpers (readJSON/writeJSON/removeKey)", () => {
  const fakeStore: Record<string, string> = {};
  const mockLS = {
    getItem: vi.fn((k: string) => (k in fakeStore ? fakeStore[k] : null)),
    setItem: vi.fn((k: string, v: string) => (fakeStore[k] = v)),
    removeItem: vi.fn((k: string) => delete fakeStore[k])
  } as any;

  beforeEach(() => {
    for (const k of Object.keys(fakeStore)) delete fakeStore[k];
    vi.stubGlobal("localStorage", mockLS);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // @ts-ignore
    vi.unstubAllGlobals();
  });

  it("writeJSON calls localStorage.setItem and readJSON parses it", () => {
    storage.writeJSON("X_TEST", { a: 1 });
    expect(mockLS.setItem).toHaveBeenCalled();
    const read = storage.readJSON("X_TEST", null);
    expect(read).toEqual({ a: 1 });
  });

  it("removeKey calls localStorage.removeItem and readJSON returns fallback", () => {
    storage.writeJSON("TMP", { x: 2 });
    storage.removeKey("TMP");
    expect(mockLS.removeItem).toHaveBeenCalledWith("TMP");
    const fallback = storage.readJSON("TMP", { ok: true });
    expect(fallback).toEqual({ ok: true });
  });
});
