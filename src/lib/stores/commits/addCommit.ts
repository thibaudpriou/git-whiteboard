import type { Commit, CommitsStore, UpdateFn } from '$types';

import { getObjectProperty } from '$lib/utils';

/**
 * Add a new commit to store
 *
 * @param update
 * @param commit
 * @returns the new commit Id
 */
export const addCommit = (
	update: UpdateFn<CommitsStore>,
	commit: Pick<Commit, 'pos' | 'parents'>
): Commit['id'] | undefined => {
	let newCommitId: Commit['id'] | undefined

	update((s) => {
		const doesPosExists = Object.values(s.idMap).some(
			(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
		);

		if (doesPosExists) return s;

		const id = s.lastCommitId + 1;
		newCommitId = id

		const idMap = {
			...s.idMap,
			[id]: {
				...commit,
				id
			}
		};

		const childrenMap = commit.parents.reduce((map, parentId, idx) => {
			const pChildren = getObjectProperty(map, parentId) ?? [];

			return {
				...map,
				[parentId]: [...pChildren, { id, branch: idx }]
			};
		}, s.childrenMap);

		return {
			...s,
			idMap,
			childrenMap,
			lastCommitId: id
		};
	});

	return newCommitId
};
