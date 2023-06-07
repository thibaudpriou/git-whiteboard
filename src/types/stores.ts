import type { ChildrenMap, Commit, CommitMap } from ".";

import type { Updater } from "svelte/store";

export interface CommitsStore {
	idMap: CommitMap;
	childrenMap: ChildrenMap;
	/** ID of last created commit */
	lastCommitId: Commit['id'];
}

export type UpdateFn<T> = (this: void, updater: Updater<T>) => void