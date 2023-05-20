export type Pos = { x: number; y: number };

export type TCommit = {
    id: string;
    pos: Pos;
    name?: string;
};