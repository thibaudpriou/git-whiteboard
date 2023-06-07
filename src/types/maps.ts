import type { Commit } from "./commit";

/** map of commit by their id */
export type CommitMap = Record<Commit['id'], Commit>;

export interface Child {
	id: Commit['id'];
	branch: number;
}

/** map of commits ids by their resp. parent */
export type ChildrenMap = Record<Commit['id'], Child[]>;
