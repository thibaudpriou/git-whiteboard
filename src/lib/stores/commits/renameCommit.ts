import { getObjectProperty } from '$lib/utils';
import type { UpdateFn, Commit, CommitsStore } from '../../../types';

export const renameCommit = (update: UpdateFn<CommitsStore>, commit: Commit, name: string) => {
	return update((s) => {
		const found = getObjectProperty(s.idMap, commit.id);
		if (!found) return s;

		return {
			...s,
			idMap: {
				...s.idMap,
				[found.id]: {
					...found,
					name
				}
			}
		};
	});
};
