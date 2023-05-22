import type { Commit } from '../../types';

/** map of commits by their resp. parent */
export type ChildrenMap = Record<Commit['id'], Commit["id"][]>

/**
 * Return a map of each commit ID by their respective parent
 * NOTE: we consider that root commit's parent ID is empty string ""
 * @param commits
 * @returns
 */
export const groupByParent = (commits: Commit[]): ChildrenMap => {
	return commits.reduce((map, c) => {
		if (c.parents === null) {
			// root commit
			return {
				...map,
				'': [c.id]
			};
		 }

		return c.parents.reduce((map2, p) => {
			const childrenIds = map2[p] ?? [];
			childrenIds.push(c.id);

			return {
				...map2,
				[p]: childrenIds
			};
		}, map);
	}, {} as ChildrenMap);
};