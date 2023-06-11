import type { Commit, CommitMap, CommitsStore, UpdateFn } from '$types';
import { getAllParents, getObjectProperty } from '$lib/utils';

const isMergeCommit = (c: {
	parents: Commit['id'][];
}): c is { parents: [Commit['id'], Commit['id']] } => {
	return c.parents.length === 2;
};

const canCreateMergeCommit = (idMap: CommitMap, commit: Pick<Commit, 'pos' | 'parents'>): boolean => {
	const m1 = commit.parents[0];
	const m2 = commit.parents[1];
	const firstCommits = getAllParents(idMap, [m1]);

	const hasDiff = !firstCommits.includes(m2);
	return hasDiff;
};

const canCreateCommit = (idMap: CommitMap, commit: Pick<Commit, 'pos' | 'parents'>): boolean => {
	if (isMergeCommit(commit) && !canCreateMergeCommit(idMap, commit)) {
		return false;
	}

	const doesPosExists = Object.values(idMap).some(
		(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
	);

	return !doesPosExists;
};

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
	let newCommitId: Commit['id'] | undefined;

	update((s) => {
		if (!canCreateCommit(s.idMap, commit)) return s;

		const id = s.lastCommitId + 1;
		newCommitId = id;

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

	return newCommitId;
};
