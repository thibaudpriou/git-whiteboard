import type { Commit } from "../../types";

/**
 * Return commit of given id
 *
 * @param everyCommits
 * @param c
 */
export const getCommitById = (
	everyCommits: Commit[],
	id: Commit['id']
) => {
	return everyCommits.find((c) => c.id === id);
};
