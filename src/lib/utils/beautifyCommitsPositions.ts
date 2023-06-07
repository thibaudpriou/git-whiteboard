import type { Commit, CommitMap, ChildrenMap } from '$types';
import { getObjectProperty } from './getObjectProperty';
import { type DepthMap, groupByDepth } from './groupByDepth';

/**
 * Return the first parent commit of given commit
 * @param commitsById
 * @param c
 * @returns
 */
const getFirstParent = (commitsById: CommitMap, c: Commit): Commit | undefined => {
	const pId = c.parents?.at(0);
	if (!pId) return undefined;

	return commitsById[pId];
};

/**
 * Recursively re-position children commits's pos.y
 *
 * Algo: each commit verifies pos.y = Math.max(parents.pos.y +1)
 * - we loop on children, and assign pos.y = parent.pos.y + 1
 * - we repeat on sub children
 * - to support merge commits i.e. commits with multiple parents: we actually assign Math.max(own.pos.x, parent.pos.x + 1)
 * so that the last pos.y assignment on commit will be correct
 *
 * IMPORTANT:
 * This function assumes that every commit positions start at the same position.
 * Otherwise the Math.max() operation will not return expected pos.y
 *
 * @param commitMap
 * @param childrenMap
 * @param parents
 * @returns re-positioned children commits of given parents
 */
const fixCommitsDepth = (
	commitMap: CommitMap,
	childrenMap: ChildrenMap,
	parents: Commit[]
): CommitMap => {
	if (!parents.length) return commitMap; // recursiv end

	return parents.reduce((map, parent) => {
		const children = getObjectProperty(childrenMap, parent.id) ?? [];

		const newCommitMap = children.reduce((map2, child) => {
			const c = getObjectProperty(map2, child.id);
			if (!c) throw new Error('children not found')

			return {
				...map2,
				[child.id]: {
					...c,
					pos: {
						...c.pos,
						y: Math.max(c.pos.y, parent.pos.y + 1)
					}
				}
			};
		}, map);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const newChildren = children.map((c) => getObjectProperty(newCommitMap, c.id)!);

		// apply to sub-children
		return fixCommitsDepth(newCommitMap, childrenMap, newChildren);
	}, commitMap);
};

/**
 * Recursively re-position children commits's pos.x
 *
 * Algo: for a given depth, each commit's order respect: parent.pos.x <= x
 * - commits are "grouped" by their 1st parent
 * - merge commits come last in a "group"
 * -
 *
 * @param commitMap
 * @param depthMap
 * @param depth
 * @returns
 */
const fixCommitsOrder = (commitMap: CommitMap, depthMap: DepthMap, depth = 0): CommitMap => {
	const ids = depthMap[depth] as Commit['id'][] | undefined;
	if (!ids?.length) return commitMap; // recursiv end

	const sortedIds: Commit['id'][] = ids.sort((id1, id2) => {
		const c1 = commitMap[id1];
		const c2 = commitMap[id2];

		const idP1 = c1.parents?.at(0);
		const idP2 = c2.parents?.at(0);
		if (!idP1 || !idP2) return 0; // shouldn't happen as root is by itself on its depth
		const p1 = commitMap[idP1];
		const p2 = commitMap[idP2];

		const diff = p1.pos.x - p2.pos.x;
		if (diff !== 0) return diff; // first parent's side

		// merge commits come last
		if (c1.parents && c1.parents.length > 1) return 1;
		return -1;
	});

	// assign pos.x for each sorted commit
	const depthRepositioned = sortedIds.reduce((map, id, idx, arr) => {
		const commit = map[id];
		const p0 = getFirstParent(map, commit);
		if (!p0) return map; // root commit: position unchanged

		let x: number;
		if (idx === 0) {
			// 1st commit for depth: give parent's pos.x (the first parent - cf sort - so "root.pos.x")
			x = p0.pos.x;
		} else {
			const prevId = arr[idx - 1];
			const prevCommit = map[prevId];
			x = Math.max(prevCommit.pos.x + 1, p0.pos.x);
		}

		return {
			...map,
			[id]: {
				...commit,
				pos: {
					...commit.pos,
					x
				}
			}
		};
	}, commitMap);

	return fixCommitsOrder(depthRepositioned, depthMap, depth + 1);
};

/**
 * Change commits positions to reorder their display
 *
 * @param idMap
 * @param childrenMap
 * @returns a new map
 */
export const beautifyCommitsPositions = (idMap: CommitMap, childrenMap: ChildrenMap): CommitMap => {
	const root = Object.values(idMap).find((c) => c.parents === null);
	if (!root) return idMap; // shouldn't happen

	// reset pos
	const resettedPosMap = Object.values(idMap).reduce(
		(map, c) => ({
			...map,
			[c.id]: {
				...c,
				pos: root.pos
			}
		}),
		{}
	);

	/** commits with correct pos.y */
	const commitMapY = fixCommitsDepth(resettedPosMap, childrenMap, [root]);

	const commitsY = Object.values(commitMapY);
	const depthMap = groupByDepth(commitsY);

	/** commits with correct pos.y & pos.x */
	return fixCommitsOrder(commitMapY, depthMap, 0);
};
