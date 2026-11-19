import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canEdit,
  canManageEditors,
  canSuggest,
  canViewSuggestion,
  ownerFreshMs,
  ownerStaleMs,
  parseAdminIds,
  planOwnerLookup,
  roleOf,
  settleOwnerAnswer,
} from "../src/lib/wiki/permissions.ts";

describe("roles", () => {
  it("derives the role from server facts", () => {
    assert.equal(roleOf(false, true, true), "anonymous");
    assert.equal(roleOf(true, true, false), "admin");
    assert.equal(roleOf(true, true, true), "admin");
    assert.equal(roleOf(true, false, true), "editor");
    assert.equal(roleOf(true, false, false), "member");
  });

  it("lets only editors and admins edit", () => {
    assert.deepEqual(
      (["anonymous", "member", "editor", "admin"] as const).map(canEdit),
      [false, false, true, true]
    );
  });

  it("lets only admins manage editors", () => {
    assert.deepEqual(
      (["anonymous", "member", "editor", "admin"] as const).map(canManageEditors),
      [false, false, false, true]
    );
  });

  it("lets every signed in role suggest", () => {
    assert.deepEqual(
      (["anonymous", "member", "editor", "admin"] as const).map(canSuggest),
      [false, true, true, true]
    );
  });

  it("shows a suggestion to its author and to editors only", () => {
    assert.equal(canViewSuggestion("member", "1", "1"), true);
    assert.equal(canViewSuggestion("member", "2", "1"), false);
    assert.equal(canViewSuggestion("anonymous", null, "1"), false);
    assert.equal(canViewSuggestion("editor", "2", "1"), true);
    assert.equal(canViewSuggestion("admin", "2", "1"), true);
  });
});

describe("DASH_ADMIN_IDS", () => {
  it("reads comma separated user ids and ignores junk", () => {
    const ids = parseAdminIds(" 123456789012345678 , nope,98765432109876543,12 ,, ");
    assert.deepEqual([...ids].sort(), ["123456789012345678", "98765432109876543"]);
  });

  it("is empty when unset", () => {
    assert.equal(parseAdminIds(undefined).size, 0);
    assert.equal(parseAdminIds("").size, 0);
  });
});

describe("ownership lookup plan", () => {
  const id = "123456789012345678";
  const now = 1_000_000_000_000;

  it("trusts configured ids without the bot or the cache", () => {
    assert.deepEqual(planOwnerLookup(id, new Set([id]), null, now), { step: "env" });
    assert.deepEqual(planOwnerLookup(id, new Set([id]), { value: false, at: now }, now), { step: "env" });
  });

  it("asks the bot when nothing is cached", () => {
    assert.deepEqual(planOwnerLookup(id, new Set(), null, now), { step: "ask-bot" });
  });

  it("uses a fresh cached answer", () => {
    assert.deepEqual(planOwnerLookup(id, new Set(), { value: true, at: now - ownerFreshMs + 1 }, now), { step: "cached", value: true });
  });

  it("asks the bot again once the answer is no longer fresh", () => {
    assert.deepEqual(planOwnerLookup(id, new Set(), { value: true, at: now - ownerFreshMs }, now), { step: "ask-bot" });
  });
});

describe("ownership answer after asking the bot", () => {
  const now = 1_000_000_000_000;

  it("uses the bot's answer and stores it", () => {
    assert.deepEqual(settleOwnerAnswer(true, null, now), { value: true, store: true });
    assert.deepEqual(settleOwnerAnswer(false, { value: true, at: now - 10 }, now), { value: false, store: true });
  });

  it("trusts the last answer for seven days when the bot cannot be reached", () => {
    assert.deepEqual(settleOwnerAnswer(null, { value: true, at: now - ownerStaleMs }, now), { value: true, store: false });
    assert.deepEqual(settleOwnerAnswer(null, { value: false, at: now - 1000 }, now), { value: false, store: false });
  });

  it("stops trusting it after seven days", () => {
    assert.deepEqual(settleOwnerAnswer(null, { value: true, at: now - ownerStaleMs - 1 }, now), { value: false, store: false });
  });

  it("is not an admin when the bot is down and nothing was cached", () => {
    assert.deepEqual(settleOwnerAnswer(null, null, now), { value: false, store: false });
  });

  it("does not trust an answer dated in the future", () => {
    assert.deepEqual(settleOwnerAnswer(null, { value: true, at: now + 5000 }, now), { value: false, store: false });
  });
});
