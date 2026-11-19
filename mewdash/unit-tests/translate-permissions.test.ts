import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canManageTranslators,
  canReviewLocale,
  canSuggestTranslation,
  canViewHistoryEntry,
  isReviewer,
  reviewableLocales,
} from "../src/lib/translate/permissions.ts";

const admin = { admin: true, locales: [] };
const german = { admin: false, locales: ["de-DE"] };
const member = { admin: false, locales: [] };

describe("translation permissions", () => {
  it("lets anyone signed in suggest", () => {
    assert.equal(canSuggestTranslation(true), true);
    assert.equal(canSuggestTranslation(false), false);
  });

  it("lets admins review every language and translators only theirs", () => {
    assert.equal(canReviewLocale(admin, "fr-FR"), true);
    assert.equal(canReviewLocale(german, "de-DE"), true);
    assert.equal(canReviewLocale(german, "fr-FR"), false);
    assert.equal(canReviewLocale(member, "de-DE"), false);
  });

  it("knows who is a reviewer", () => {
    assert.equal(isReviewer(admin), true);
    assert.equal(isReviewer(german), true);
    assert.equal(isReviewer(member), false);
  });

  it("lists the languages a person may review", () => {
    const all = ["de-DE", "fr-FR", "ja-JP"];
    assert.deepEqual(reviewableLocales(admin, all), all);
    assert.deepEqual(reviewableLocales(german, all), ["de-DE"]);
    assert.deepEqual(reviewableLocales(german, ["fr-FR"]), []);
    assert.deepEqual(reviewableLocales(member, all), []);
  });

  it("lets only admins manage translators", () => {
    assert.equal(canManageTranslators(true), true);
    assert.equal(canManageTranslators(false), false);
  });

  it("shows approved history to everyone and the rest to the author and reviewers", () => {
    const approved = { status: "approved", locale: "de-DE", userId: "1" };
    const declined = { status: "declined", locale: "de-DE", userId: "1" };
    assert.equal(canViewHistoryEntry(member, null, approved), true);
    assert.equal(canViewHistoryEntry(member, null, declined), false);
    assert.equal(canViewHistoryEntry(member, "2", declined), false);
    assert.equal(canViewHistoryEntry(member, "1", declined), true);
    assert.equal(canViewHistoryEntry(german, "2", declined), true);
    assert.equal(canViewHistoryEntry(german, "2", { ...declined, locale: "fr-FR" }), false);
    assert.equal(canViewHistoryEntry(admin, "2", { ...declined, locale: "fr-FR" }), true);
  });
});
