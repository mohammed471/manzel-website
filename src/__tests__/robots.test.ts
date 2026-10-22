import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lets crawlers in by default (production must never be noindex by accident)", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("closes the whole site when NEXT_PUBLIC_ALLOW_INDEXING=false (staging)", () => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_INDEXING", "false");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});
