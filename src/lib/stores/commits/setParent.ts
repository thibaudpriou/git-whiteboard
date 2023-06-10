import type { Commit, CommitsStore, UpdateFn } from '$types';

import { getObjectProperty } from '$lib/utils';

export const setParent = (
	update: UpdateFn<CommitsStore>,
	id: Commit['id'],
	parentId: Commit['id']
) => {
	return update((s) => {
		const commit = getObjectProperty(s.idMap, id);
		if (!commit) return s;

		const idMap = {
			...s.idMap,
			[id]: {
				...commit,
				parents: [parentId]
			} as Commit
		};

		const childrenMap = { ...s.childrenMap };
		commit.parents.forEach((p) => {
			const parent = getObjectProperty(childrenMap, id);
			if (!parent) throw new Error('parent not found in children map');

			childrenMap[p] = s.childrenMap[p].filter((child) => child.id !== id);
		});
		const parentChildren = getObjectProperty(s.childrenMap, parentId);
		childrenMap[parentId] = [...(parentChildren ?? []), { id: parentId, branch: 0 }];

		return {
			...s,
			idMap,
			childrenMap: childrenMap ?? s.childrenMap
		};
	});
};
