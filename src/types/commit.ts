import type { Pos } from "./pos";

export type Commit = {
	id: number;
	pos: Pos;
	name?: string;
	parents: Commit['id'][];
};

export type CommitWithParents = Commit & {
	parentsCommits: Commit[];
};