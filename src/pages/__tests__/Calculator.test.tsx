import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Calculator from "../Calculator";
import { ThemeProvider } from "@/components/theme-provider";
import { draftKey, lastModeKey, modes, readWorkspace, resultKey, writeWorkspace, WorkspaceMode } from "@/utils/calculatorWorkspace";

vi.mock("@/components/Layout", () => ({ Layout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/SEO", () => ({ SEO: () => null }));
vi.mock("@/components/results/CalculationResults", () => ({ CalculationResults: ({ onEditInputs }: { onEditInputs: () => void }) => <button onClick={onEditInputs}>Return to inputs</button> }));

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output data-testid="url">{location.search}</output><button onClick={() => navigate(-1)}>Browser back</button><button onClick={() => navigate(1)}>Browser forward</button></>;
}
function mount(mode?: WorkspaceMode) {
  return render(<MemoryRouter initialEntries={[mode ? `/calculator?mode=${mode}&view=inputs` : "/calculator"]}>
    <ThemeProvider><TooltipProvider><Navigation /><Calculator /></TooltipProvider></ThemeProvider>
  </MemoryRouter>);
}
vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
const field = (id: string) => (document.getElementById(id) || document.querySelector(`input[name="${id}"]`)) as HTMLInputElement;
const change = (id: string, value: string) => fireEvent.change(field(id), { target: { value } });
const switchTab = (name: string) => fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0, ctrlKey: false });
async function calculate() {
  fireEvent.submit(document.querySelector("form")!);
  await waitFor(() => expect(screen.getByRole("button", { name: "Return to inputs" })).toBeTruthy());
}

beforeEach(() => {
  localStorage.clear();
  for (const mode of modes) { writeWorkspace(draftKey(mode), {}); writeWorkspace(resultKey(mode), null); }
  writeWorkspace(lastModeKey, "PIPELINE_TRACK");
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("continuous calculator", () => {
  it.each(modes)("keeps the complete %s form through calculate, edit, stale results and recalculate", async mode => {
    mount(mode);
    expect(screen.getByRole("tab", { name: "Results" }).hasAttribute("disabled")).toBe(true);
    change("calculationName", `Draft ${mode}`);
    change("depthCover", "2.3");
    const originalForm = document.querySelector("form");
    await calculate();
    expect(screen.getByTestId("url").textContent).toContain("view=results");
    fireEvent.click(screen.getByRole("button", { name: "Return to inputs" }));
    expect(document.querySelector("form")).toBe(originalForm);
    expect(field("depthCover").value).toBe("2.3");
    expect(field("calculationName").value).toBe(`Draft ${mode}`);
    change("depthCover", "2.8");
    switchTab("Results •");
    expect(screen.getByText(/Recalculate required/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Return to inputs" }));
    await calculate();
    expect(screen.queryByText(/Recalculate required/)).toBeNull();
  });
  it("keeps separate drafts and restores the last mode after remount", () => {
    const page = mount("2_AXLE");
    change("depthCover", "3.1");
    switchTab("Grid Load");
    change("depthCover", "4.2");
    switchTab("2-Axle");
    expect(field("depthCover").value).toBe("3.1");
    page.unmount();
    mount();
    expect(screen.getByTestId("url").textContent).toContain("mode=2_AXLE");
    expect(field("depthCover").value).toBe("3.1");
  });
  it("restores units, custom soil and pipe fields, conditional values and empty fields", () => {
    writeWorkspace(draftKey("GRID"), { unitsSystem: "EN", soilDensity: 101.7, depthCover: "", selectedNPS: "CUSTOM", selectedSchedule: "Custom", pipeOD: 8.25, pipeWT: 0.3, codeCheck: "USER_DEFINED", userDefinedLimits: { hoopLimitPct: 81, longLimitPct: 82, equivLimitPct: 83 } });
    mount("GRID");
    expect(field("depthCover").value).toBe("");
    expect(field("pipeOD").value).toBe("8.25");
    expect((screen.getByPlaceholderText(/Enter custom density/) as HTMLInputElement).value).toBe("101.7");
    expect(readWorkspace<Record<string, unknown>>(draftKey("GRID"))?.unitsSystem).toBe("EN");
    expect(field("userDefinedLimits.hoopLimitPct").value).toBe("81");
    fireEvent.submit(document.querySelector("form")!);
    expect(screen.getByTestId("url").textContent).toContain("view=inputs");
  });
  it("restores PE fields and retains a cleared optional value across mode switches", () => {
    writeWorkspace(draftKey("2_AXLE"), { pipeMaterial: "PE", peSizeId: "CUSTOM", pipeOD: 200, pipeWT: 20, dimensionRatio: 10, peModulusMode: "CUSTOM", peModulus: 725, peServiceTempC: "", soilDensity: 1600, soilDensityMode: "custom" });
    mount("2_AXLE");
    expect(field("peModulus").value).toBe("725");
    expect(field("peServiceTempC").value).toBe("");
    expect((screen.getByPlaceholderText(/Enter custom density/) as HTMLInputElement).value).toBe("1600");
    switchTab("Grid Load");
    switchTab("2-Axle");
    expect(field("peModulus").value).toBe("725");
    expect(field("peServiceTempC").value).toBe("");
  });
  it("supports browser back and forward without clearing the form", async () => {
    mount("3_AXLE");
    change("depthCover", "2.4");
    await calculate();
    fireEvent.click(screen.getByRole("button", { name: "Browser back" }));
    await waitFor(() => expect(screen.getByTestId("url").textContent).toContain("view=inputs"));
    expect(field("depthCover").value).toBe("2.4");
    fireEvent.click(screen.getByRole("button", { name: "Browser forward" }));
    await waitFor(() => expect(screen.getByTestId("url").textContent).toContain("view=results"));
  });
  it("keeps working with blocked storage, including the theme provider", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    mount("GRID");
    expect(screen.getByText(/Browser storage is unavailable/)).toBeTruthy();
    change("depthCover", "3.7");
    switchTab("2-Axle");
    switchTab("Grid Load");
    expect(field("depthCover").value).toBe("3.7");
  });

});
