import type { Commit } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { writable, type Updater } from 'svelte/store';
import { applyToChildren } from './utils';

interface TStore {
	commits: Commit[];
}

type UpdateFn = (this: void, updater: Updater<TStore>) => void;

const addCommit = (update: UpdateFn, commit: Pick<Commit, 'pos' | 'parents'>) => {
	return update((r) => {
		const doesPosExists = r.commits.some(
			(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
		);

		if (doesPosExists) return r;

		const newCommit = {
			...commit,
			id: uuidv4()
		};

		return {
			...r,
			commits: [...r.commits, newCommit]
		};
	});
};

const moveCommit = (update: UpdateFn, id: Commit['id'], pos: Commit['pos']) => {
	return update((r) => {
		const commits = r.commits;
		const found = commits.find((c) => c.id === id);
		if (!found) return r;

		
		const translation = {
			x: pos.x - found.pos.x,
			y: pos.y - found.pos.y,
		}

		found.pos = pos; // apply to commit

		return {
			...r,
			commits: applyToChildren(commits, id, c => {
				return {
					...c,
					pos: {
						x: c.pos.x + translation.x,
						y: c.pos.y + translation.y
					}
				}
			})
		};
	});
};

const renameCommit = (update: UpdateFn, commit: Commit, name: string) => {
	return update((r) => {
		const commits = r.commits;
		const found = commits.find((c) => c.id === commit.id);
		if (!found) return r;

		found.name = name;
		return {
			...r,
			commits
		};
	});
};

const createStore = () => {
	const { subscribe, update } = writable<TStore>({
		commits: [
			{
				id: uuidv4(),
				pos: { x: 0, y: 0 },
				name: 'Root',
				parents: null
			}
		]
	});

	return {
		subscribe,
		addCommit: addCommit.bind(null, update),
		moveCommit: moveCommit.bind(null, update),
		renameCommit: renameCommit.bind(null, update)
	};
};

export const store = createStore();
