import { getObjectProperty } from '$lib/utils';
import { v4 as uuidv4 } from 'uuid';
import type { UpdateFn, Commit, CommitsStore } from '$types';

export const addCommit = (
	update: UpdateFn<CommitsStore>,
	commit: Pick<Commit, 'pos' | 'parents'>
) => {
	return update((s) => {
		const doesPosExists = Object.values(s.idMap).some(
			(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
		);

		if (doesPosExists) return s;

		const id = uuidv4();

		const idMap = {
			...s.idMap,
			[id]: {
				...commit,
				id
			}
		};

		const childrenMap = commit.parents?.reduce((map, parentId, idx) => {
			const pChildren = getObjectProperty(map, parentId) ?? [];

			return {
				...map,
				[parentId]: [...pChildren, { id, branch: idx }]
			};
		}, s.childrenMap);

		return {
			...s,
			idMap,
			childrenMap: childrenMap ?? s.childrenMap
		};
	});
};
