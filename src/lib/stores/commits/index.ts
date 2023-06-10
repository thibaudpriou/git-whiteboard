import type { CommitsStore } from '$types';
import { addCommit } from './addCommit';
import { beautify } from './beautify';
import { deleteCommit } from './deleteCommit';
import { moveCommit } from './moveCommit';
import { removeParents } from './removeParents';
import { renameCommit } from './renameCommit';
import { setParent } from './setParent';
import { writable } from 'svelte/store';

const createCommitsStore = () => {
	const { subscribe, update } = writable<CommitsStore>({
		idMap: {
			0: {
				id: 0,
				pos: { x: 0, y: 0 },
				name: 'Root',
				parents: []
			}
		},
		childrenMap: {
			0: []
		},
		lastCommitId: 0
	});

	return {
		subscribe,
		addCommit: addCommit.bind(null, update),
		beautify: beautify.bind(null, update),
		delete: deleteCommit.bind(null, update),
		moveCommit: moveCommit.bind(null, update),
		removeParents: removeParents.bind(null, update),
		renameCommit: renameCommit.bind(null, update),
		setParent: setParent.bind(null, update)
	};
};

export const commits = createCommitsStore();
