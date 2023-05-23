import type { Child, ChildrenMap, Commit } from '../../types';

import { getObjectProperty } from './getObjectProperty';

const isfirstChild = (c: Child | undefined): c is Child => c?.branch === 0;

/**
 * Recursively find every commits that have given commits ids as parents, even indirectly.
 * NOTE: here we only return commits for the first parents (to not include merged ones)
 *
 * @param map
 * @param id
 * @returns an array of id
 */
export const getAllFirstChildren = (map: ChildrenMap, ids: Commit['id'][]): Commit['id'][] => {
	const getChildren = (id: Commit['id']) => getObjectProperty(map, id);
	const directChildren = ids
		.map(getChildren)
		.flat()
		.filter(isfirstChild)
		.map((c) => c.id);

	if (!directChildren.length) return []; // recursiv end

	return [...directChildren, ...getAllFirstChildren(map, directChildren)];
};
