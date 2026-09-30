import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); vi.resetModules(); });

describe("workspace persistence", () => {
  it("reads legacy drafts and merges only missing fields, including nested defaults", async () => {
    const { readWorkspace, mergeDraft } = await import("../calculatorWorkspace");
    localStorage.setItem("legacy", JSON.stringify({ name: "", depth: 0, optional: null, limits: { hoop: 85 } }));
    expect(mergeDraft({ name: "default", depth: 10, optional: 2, units: "SI", limits: { hoop: 90, long: 90 } }, readWorkspace("legacy")!))
      .toEqual({ name: "", depth: 0, optional: null, units: "SI", limits: { hoop: 85, long: 90 } });
  });
  it("preserves cleared numbers and restores values across module reloads", async () => {
    let store = await import("../calculatorWorkspace");
    store.writeWorkspace("draft", { depth: NaN, name: "Mine", units: "EN" });
    vi.resetModules();
    store = await import("../calculatorWorkspace");
    expect(store.readWorkspace("draft")).toEqual({ depth: "", name: "Mine", units: "EN" });
  });
  it("ignores corrupted JSON and invalid saved results", async () => {
    const store = await import("../calculatorWorkspace");
    localStorage.setItem("broken", "{bad");
    expect(store.readWorkspace("broken")).toBeUndefined();
    store.writeWorkspace(store.resultKey("GRID"), { run: { mode: "2_AXLE" } });
    expect(store.getSavedResult("GRID")).toBeUndefined();
  });
  it("continues saving to memory when localStorage throws", async () => {
    const store = await import("../calculatorWorkspace");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(store.readWorkspace("new")).toBeUndefined();
    store.writeWorkspace("new", { density: 1555 });
    expect(store.readWorkspace("new")).toEqual({ density: 1555 });
  });
  it("compares snapshots independently of object key order", async () => {
    const { serialize } = await import("../calculatorWorkspace");
    expect(serialize({ b: 2, a: { y: 1, x: NaN } })).toBe(serialize({ a: { x: "", y: 1 }, b: 2 }));
  });
});
