import type { Pos } from "./pos";

export type Commit = {
	id: number;
	pos: Pos;
	name?: string;
	parents: [Commit['id']] | [Commit['id'], Commit['id']] | null;
};

export type CommitWithParents = Commit & {
	parentsCommits: [Commit] | [Commit, Commit] | null;
};