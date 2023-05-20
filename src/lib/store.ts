import type { TCommit } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { writable, type Updater } from 'svelte/store';

interface TStore {
	commits: TCommit[];
	links: {
		start: TCommit;
		end: TCommit;
	}[];
}

type UpdateFn = (this: void, updater: Updater<TStore>) => void;

const addCommit = (update: UpdateFn, c: Omit<TCommit, 'id'>, parent: TCommit) => {
	return update((r) => {
		const newCommit = {
			...c,
			id: uuidv4()
		};
		const newLink = parent && {
			start: parent,
			end: newCommit
		};

		return {
			...r,
			commits: [...r.commits, newCommit],
			...(newLink && {
				links: [...r.links, newLink]
			})
		};
	});
};

const renameCommit = (update: UpdateFn, commit: TCommit, name: string) => {
	return update((r) => {
		const commits = r.commits;
		const found = commits.find((c) => c.id === commit.id);
		if (!found) {
			return r;
		}

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
				name: 'Root'
			}
		],
		links: []
	});

	return {
		subscribe,
		addCommit: addCommit.bind(null, update),
		renameCommit: renameCommit.bind(null, update)
	};
};

export const store = createStore();