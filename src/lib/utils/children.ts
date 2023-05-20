import type { TCommit } from '../../types';

/**
 * Recursively find every commits that have given commits ids as parents, even indirectly.
 * NOTE: here we only return commits for the first parents (to not include merged ones)
 *
 * @param commits
 * @param id
 * @returns an array of id
 */
const getDescendants = (commits: TCommit[], ids: TCommit['id'][]): TCommit['id'][] => {
	const directDescendants = commits
		.filter((c) => {
			const firstParent = c.parents?.at(0);
			return firstParent && ids.includes(firstParent);
		})
		.map((d) => d.id);

	if (!directDescendants.length) return [];

	return [...directDescendants, ...getDescendants(commits, directDescendants)];
};

/**
 * Apply given callback to every commits that given commits ids as parents, even indirectly.
 * NOTE: here we only return commits for the first parents (to not include merged ones)
 *
 * @param commits
 * @param id
 * @param cb
 * @returns
 */
export const applyToChildren = (
	commits: TCommit[],
	id: TCommit['id'],
	cb: (c: TCommit) => TCommit
) => {
	const children = getDescendants(commits, [id]);

	return commits.map((c) => {
		if (children.includes(c.id)) {
			return cb(c);
		}
		return c;
	});
};
