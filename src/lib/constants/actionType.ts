export enum ActionType {
	CANCEL = 'Escape',

	// with toggle behavior
	RENAME = 'n',
	MOVE = 'o', // !FIXME naming: order? reorder?
	COMMIT = 'c',
	MERGE = 'm'
}
