import type { Commit, CommitMap } from '$types';

import { getObjectProperty } from './getObjectProperty';

/**
 * Recursively find every commits that have given ids as parents, directly or not.
 *
 * @param map
 * @param ids
 * @returns an array of commit ids
 */
export const getAllParents = (map: CommitMap, ids: Commit['id'][]): Commit['id'][] => {
	const getCommit = (id: Commit['id']) => getObjectProperty(map, id);

	const parentsIds = ids
		.map(id => {
			const c = getCommit(id)
			return c?.parents ?? []
		})
		.flat()

	if (!parentsIds.length) return []; // recursiv end

	return [...parentsIds, ...getAllParents(map, parentsIds)];
};
