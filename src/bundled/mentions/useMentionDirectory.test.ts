import { expect, it, vi } from "vitest";
import type { ComposerSession } from "../../features/messages/composer-session";
import { fetchMentionDirectoryPage } from "./useMentionDirectory";

it("keeps a verified person when a refined query matches only their verified full name", async () => {
  const kevin = { pubkey: "a".repeat(64), name: "Kevin" };
  const other = { pubkey: "b".repeat(64), name: "Kevin" };
  const shared = new Map([
    [
      kevin.pubkey,
      {
        name: "kgraham",
        verified: { displayName: "kgraham", fullName: "Kevin Graham" },
      },
    ],
  ]);
  const people = vi.fn(async () => ({
    people: [kevin, other],
    hasMore: false,
  }));
  const session = {
    directMessages: { people },
    profiles: { snapshot: () => shared },
  } as unknown as ComposerSession;
  const signal = new AbortController().signal;
  await fetchMentionDirectoryPage(session, "kevin", signal);
  // The complete page for "kevin" answers "kevin g" without another read.
  const refined = await fetchMentionDirectoryPage(session, "kevin g", signal);
  expect(people).toHaveBeenCalledOnce();
  expect(refined.people).toEqual([kevin]);
});
