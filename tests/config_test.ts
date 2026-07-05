import { assertEquals, assert } from "jsr:@std/assert";
import {
  isValidTelegramId,
  isValidTonAddress,
  isPositiveNumber,
  checkRateLimit,
  MUDD_ORE_TO_MUDD_RATE,
  MIN_WITHDRAWAL_MUDD_ORE,
  G0_WALLET_ADDRESS,
} from "../config.ts";

// ── Validation Helpers ──

Deno.test("isValidTelegramId: accepts valid IDs", () => {
  assert(isValidTelegramId("123456789"));
  assert(isValidTelegramId("999999999999"));
});

Deno.test("isValidTelegramId: rejects invalid IDs", () => {
  assert(!isValidTelegramId(""));
  assert(!isValidTelegramId("abc"));
  assert(!isValidTelegramId("123"));
  assert(!isValidTelegramId("-1"));
  assert(!isValidTelegramId("123456789123456789123456789"));
});

Deno.test("isValidTonAddress: accepts valid TON addresses", () => {
  assert(isValidTonAddress("UQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk"));
  assert(isValidTonAddress("0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8"));
  assert(isValidTonAddress("kQAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548PcpH5"));
  assert(isValidTonAddress("EQAB3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcabc"));
});

Deno.test("isValidTonAddress: rejects invalid addresses", () => {
  assert(!isValidTonAddress(""));
  assert(!isValidTonAddress("not_an_address"));
  assert(!isValidTonAddress("UQshort"));
  assert(!isValidTonAddress("XQAYOzRSA7UkfOpdfsvU0MRZdgJU95lnCrwQWQehW60E-Rrk"));
});

Deno.test("isPositiveNumber: accepts positive numbers", () => {
  assert(isPositiveNumber(1));
  assert(isPositiveNumber(0.01));
  assert(isPositiveNumber(999999));
});

Deno.test("isPositiveNumber: rejects non-positive or non-numbers", () => {
  assert(!isPositiveNumber(0));
  assert(!isPositiveNumber(-1));
  assert(!isPositiveNumber(NaN));
  assert(!isPositiveNumber(Infinity));
  assert(!isPositiveNumber("1"));
  assert(!isPositiveNumber(null));
  assert(!isPositiveNumber(undefined));
});

// ── Rate Limiter ──

Deno.test("checkRateLimit: allows requests under limit", () => {
  const key = `test_allow_${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    assert(checkRateLimit(key, 10, 60_000));
  }
});

Deno.test("checkRateLimit: blocks requests over limit", () => {
  const key = `test_block_${Date.now()}`;
  for (let i = 0; i < 10; i++) {
    assert(checkRateLimit(key, 10, 60_000));
  }
  // 11th request should be blocked
  assert(!checkRateLimit(key, 10, 60_000));
});

// ── Config Constants ──

Deno.test("Config: G0 wallet address is set", () => {
  assert(G0_WALLET_ADDRESS.length > 0);
  assert(G0_WALLET_ADDRESS.startsWith("0Q"));
});

Deno.test("Config: conversion rate is 1000:1", () => {
  assertEquals(MUDD_ORE_TO_MUDD_RATE, 1000);
});

Deno.test("Config: min withdrawal is 1000 MuddOre", () => {
  assertEquals(MIN_WITHDRAWAL_MUDD_ORE, 1000);
});
