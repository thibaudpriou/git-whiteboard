import type { ChildrenMap, Commit, CommitMap } from '$types';

import { getObjectProperty } from './getObjectProperty';

/**
 * Return another idMap where given commit's parents prop is reset
 *
 * @param idMap
 * @param id
 * @returns a new idMap
 */
export const removeParentsFromIdMap = (idMap: CommitMap, id: Commit['id']) => {
	return {
		...idMap,
		[id]: {
			...idMap[id],
			parents: []
		}
	};
};

export const removeChildFromChildrenMap = (
	childrenMap: ChildrenMap,
	childId: Commit['id'],
	parents: Commit['id'][] | null
) => {
    if (!parents) return childrenMap

	return parents.reduce((map, id) => {
		const children = getObjectProperty(childrenMap, id);
		if (!children) throw new Error('id not found in children map: ' + id);

		return {
            ...map,
            [id]: map[id].filter((child) => child.id !== childId)
        }
	}, childrenMap);
};
