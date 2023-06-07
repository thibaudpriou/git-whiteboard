import type { Commit } from '$types';

/** map of commits by their resp. depth (pos.y) */
export type DepthMap = Record<number, Commit['id'][]>;

/**
 * Return a map of each commit ID by their resp. depth (pos.y)
 * @param commits
 * @returns
 */
export const groupByDepth = (commits: Commit[]): DepthMap => {
	const minDepth = Math.min(...commits.map((c) => c.pos.y));

	return commits.reduce((acc, c) => {
		const d = c.pos.y - minDepth; // start at 0
		const forDepth = acc[d] ?? [];
		forDepth.push(c.id);

		return {
			...acc,
			[d]: forDepth
		};
	}, {} as DepthMap);
};
