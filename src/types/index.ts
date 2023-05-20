export type Pos = { x: number; y: number };

export type TCommit = {
	id: string;
	pos: Pos;
	name?: string;
	parents: [TCommit['id']] | [TCommit['id'], TCommit['id']] | null;
};
