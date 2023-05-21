import type { Commit } from '../../types';

interface RepositionReducedResult {
	arr: Commit[];
	repositionedCommits: Commit[];
}

/**
 * Recursively re-position children commits
 *
 * @param commits
 * @param parent
 * @returns re-positioned commits
 */
const repositionChildren = (commits: Commit[], parents: Commit[]): Commit[] => {
	if (!parents.length) return commits;

	const reduced = parents.reduce<RepositionReducedResult>(
		(accParent, p) => {
			const { arr, repositionedCommits } = accParent.arr.reduce<RepositionReducedResult>(
				(acc, c) => {
					if (c.parents?.at(0) !== p.id) {
						// don't reposition
						return {
							...acc,
							arr: [...acc.arr, c]
						};
					}

					const newCommit = {
						...c,
						pos: {
							x: p.pos.x + acc.repositionedCommits.length,
							y: p.pos.y + 1
						}
					};

					return {
						arr: [...acc.arr, newCommit],
						repositionedCommits: [...acc.repositionedCommits, newCommit]
					};
				},
				{ arr: [], repositionedCommits: [] }
			);

			return {
				arr,
				repositionedCommits: [...accParent.repositionedCommits, ...repositionedCommits]
			};
		},
		{ arr: commits, repositionedCommits: [] }
	);

	return repositionChildren(reduced.arr, reduced.repositionedCommits);
};

/**
 * Change commits positions to reorder their display
 *
 * @param commits
 * @returns commits
 */
export const beautifyCommitsPositions = (commits: Commit[]): Commit[] => {
	const root = commits.find((c) => c.parents === null);
	if (!root) return commits; // shouldn't happen

	return repositionChildren(commits, [root]);
};
