export interface Pos {
	x: number;
	y: number;
}
export interface Pos3D extends Pos {
	z: number;
}

export type Commit = {
	id: string;
	pos: Pos;
	name?: string;
	parents: [Commit['id']] | [Commit['id'], Commit['id']] | null;
};

export type CommitWithParents = Commit & {
	parentsCommits: [Commit] | [Commit, Commit] | null;
};

/** map of commit by their id */
export type CommitMap = Record<Commit['id'], Commit>;

export interface Child {
	id: Commit['id'];
	branch: number;
}

/** map of commits ids by their resp. parent */
export type ChildrenMap = Record<Commit['id'], Child[]>;
