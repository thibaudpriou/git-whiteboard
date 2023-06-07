import type { CommitsStore, UpdateFn } from '../../../types';
import { beautifyCommitsPositions } from '$lib/utils';

export const beautify = (update: UpdateFn<CommitsStore>) => {
	return update((s) => {
		return {
			...s,
			idMap: beautifyCommitsPositions(s.idMap, s.childrenMap)
		};
	});
};
