import type { Commit } from "../../types";

/**
 * Return given commit with its parent commits
 *
 * @param everyCommits
 * @param c
 */
export const hydrateParentsCommitsCb = <T extends Partial<Commit>>(
	everyCommits: Commit[],
	c: T
) => {
	return {
		...c,
		parentCommits:
			c.parents?.map((pid) => {
				const parentCommit = everyCommits.find((c2) => c2.id === pid);
				if (!parentCommit) throw new Error('parent not found');

				return parentCommit;
			}) ?? []
	};
};
