export interface Pos {
	x: number;
	y: number;
}
export interface Pos3D extends Pos {
	z: number;
}

export type TCommit = {
	id: string;
	pos: Pos;
	name?: string;
	parents: [TCommit['id']] | [TCommit['id'], TCommit['id']] | null;
};
