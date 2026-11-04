import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("passwords", () => {
  it("hashes a password and verifies the original", async () => {
    const hash = await hashPassword("test1");
    expect(hash).not.toBe("test1");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("test1", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("test1");
    expect(await verifyPassword("test2", hash)).toBe(false);
  });

  it("produces a different hash for the same password", async () => {
    const [first, second] = await Promise.all([
      hashPassword("test1"),
      hashPassword("test1"),
    ]);
    expect(first).not.toBe(second);
  });
});
