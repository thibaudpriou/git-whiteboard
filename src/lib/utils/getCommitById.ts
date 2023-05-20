import type { TCommit } from "../../types";

/**
 * Return commit of given id
 *
 * @param everyCommits
 * @param c
 */
export const getCommitById = (
	everyCommits: TCommit[],
	id: TCommit['id']
) => {
	return everyCommits.find((c) => c.id === id);
};
