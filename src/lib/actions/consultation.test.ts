import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase server client. `insertMock` is what each test inspects /
// configures to simulate success or DB errors.
const insertMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

import { submitConsultationLead } from "./consultation";

const validInput = {
  name: "Test Person",
  phone: "61445999",
  areas: ["Uønsket hår"],
  recommendations: ["Laser hårfjerning"],
};

beforeEach(() => {
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("submitConsultationLead — validation", () => {
  it("rejects an empty name", async () => {
    const result = await submitConsultationLead({ ...validInput, name: "  " });
    expect(result).toEqual({ ok: false, error: "Udfyld venligst dit navn." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a phone number with fewer than 8 digits", async () => {
    const result = await submitConsultationLead({ ...validInput, phone: "12 34 56" });
    expect(result.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepts a formatted phone number with at least 8 digits", async () => {
    const result = await submitConsultationLead({ ...validInput, phone: "+45 61 44 59 99" });
    expect(result).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("rejects a phone number that is letters only", async () => {
    const result = await submitConsultationLead({ ...validInput, phone: "abcdefgh" });
    expect(result.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("submitConsultationLead — persistence", () => {
  it("trims fields, filters falsy areas/recommendations and stores the lead", async () => {
    const result = await submitConsultationLead({
      name: "  Jane Doe  ",
      phone: "  61445999  ",
      note: "  ring efter 16  ",
      areas: ["Ben", "", "Arme"],
      recommendations: ["Laser", ""],
    });

    expect(result).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledOnce();
    const [rows] = insertMock.mock.calls[0];
    expect(rows[0]).toMatchObject({
      name: "Jane Doe",
      phone: "61445999",
      note: "ring efter 16",
      areas: ["Ben", "Arme"],
      recommendations: ["Laser"],
    });
  });

  it("stores null when the note is empty", async () => {
    await submitConsultationLead({ ...validInput, note: "   " });
    const [rows] = insertMock.mock.calls[0];
    expect(rows[0].note).toBeNull();
  });

  it("returns a friendly error when the insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "duplicate key" } });
    const result = await submitConsultationLead(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("61 44 59 99");
  });

  it("returns a friendly error when the client throws unexpectedly", async () => {
    insertMock.mockRejectedValue(new Error("network down"));
    const result = await submitConsultationLead(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("uventet fejl");
  });
});
