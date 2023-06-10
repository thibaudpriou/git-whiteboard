import type { Commit, CommitsStore, UpdateFn } from '$types';
import { getObjectProperty, removeChildFromChildrenMap, removeParentsFromIdMap } from '$lib/utils';

export const removeParents = (update: UpdateFn<CommitsStore>, id: Commit['id']) => {
	return update((s) => {
		const found = getObjectProperty(s.idMap, id);
		if (!found) return s;

		const idMap = removeParentsFromIdMap(s.idMap, found.id);
		const childrenMap = removeChildFromChildrenMap(s.childrenMap, found.id, found.parents);

		// TODO remove children's links?
		// TODO setTimeout: recreate children's links?

		return {
			...s,
			idMap,
			childrenMap: childrenMap
		};
	});
};
