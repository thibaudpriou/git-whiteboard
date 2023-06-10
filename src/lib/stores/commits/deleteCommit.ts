import type { Commit, CommitsStore, UpdateFn } from '$types';

import { getObjectProperty } from '$lib/utils';

export const deleteCommit = (update: UpdateFn<CommitsStore>, id: Commit['id']) => {
	return update((s) => {
		const idMap = { ...s.idMap };
		const childrenMap = { ...s.childrenMap };

		const commit = getObjectProperty(idMap, id);

		// del commit
		delete idMap[id];

		// del parent->commit
		commit?.parents.forEach((p) => {
			const parentChildren = getObjectProperty(childrenMap, p);
			if (!parentChildren) return;

			childrenMap[p] = parentChildren.filter((c) => c.id === id);
		});

		// del commit->children
		const children = getObjectProperty(childrenMap, id);
		children?.forEach((c) => {
			const childCommit = getObjectProperty(idMap, c.id);
			if (!childCommit) return;

			const childParents =
				childCommit.parents && (childCommit.parents.filter((p) => p !== id) as Commit['parents']);

			idMap[c.id] = {
				...childCommit,
				parents: childParents
			};
		});
		delete childrenMap[id];

		return {
			...s,
			idMap,
			childrenMap
		};
	});
};
