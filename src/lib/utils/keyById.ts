import type { Commit } from '../../types';

/** map of commit by their id */
export type CommitMap = Record<Commit['id'], Commit>

/**
 * Return a map of each commit by their ID
 * @param commits 
 * @returns 
 */
export const keyById = (commits: Commit[]): CommitMap => {
	return commits.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as CommitMap);
};