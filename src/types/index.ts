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
