import type { ChildrenMap, Commit, CommitMap } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { writable, type Updater } from 'svelte/store';
import { beautifyCommitsPositions, getAllFirstChildren, getObjectProperty } from '$lib/utils';

interface CommitsStore {
	idMap: CommitMap;
	childrenMap: ChildrenMap;
}

type UpdateFn = (this: void, updater: Updater<CommitsStore>) => void;

const addCommit = (update: UpdateFn, commit: Pick<Commit, 'pos' | 'parents'>) => {
	return update((r) => {
		const doesPosExists = Object.values(r.idMap).some(
			(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
		);

		if (doesPosExists) return r;

		const id = uuidv4();

		const idMap = {
			...r.idMap,
			[id]: {
				...commit,
				id
			}
		};

		const childrenMap = commit.parents?.reduce((map, parentId, idx) => {
			const pChildren = getObjectProperty(map, parentId) ?? [];

			return {
				...map,
				[parentId]: [...pChildren, { id, branch: idx }]
			};
		}, r.childrenMap);

		return {
			...r,
			idMap,
			childrenMap
		};
	});
};

const beautify = (update: UpdateFn) => {
	return update((r) => {
		return {
			...r,
			idMap: beautifyCommitsPositions(r.idMap, r.childrenMap)
		};
	});
};

const moveCommit = (update: UpdateFn, id: Commit['id'], pos: Commit['pos']) => {
	return update((r) => {
		const commit = getObjectProperty(r.idMap, id);
		if (!commit) return r;

		const translation = {
			x: pos.x - commit.pos.x,
			y: pos.y - commit.pos.y
		};
		const translate = (c: Commit): Commit => ({
			...c,
			pos: {
				x: c.pos.x + translation.x,
				y: c.pos.y + translation.y
			}
		});

		const childrenIds = getAllFirstChildren(r.childrenMap, [id]);
		const toTranslate = [id, ...childrenIds];

		return {
			...r,
			idMap: toTranslate.reduce((map, i) => {
				const c = getObjectProperty(map, i);
				if (!c) return map; // shouldn't happen

				return {
					...map,
					[i]: translate(c)
				};
			}, r.idMap)
		};
	});
};

const renameCommit = (update: UpdateFn, commit: Commit, name: string) => {
	return update((r) => {
		const found = getObjectProperty(r.idMap, commit.id);
		if (!found) return r;

		return {
			...r,
			idMap: {
				...r.idMap,
				[found.id]: {
					...found,
					name
				}
			}
		};
	});
};

const createCommitsStore = () => {
	const rootId = uuidv4();
	const { subscribe, update } = writable<CommitsStore>({
		idMap: {
			[rootId]: {
				id: rootId,
				pos: { x: 0, y: 0 },
				name: 'Root',
				parents: null
			}
		},
		childrenMap: {
			[rootId]: []
		}
	});

	return {
		subscribe,
		addCommit: addCommit.bind(null, update),
		beautify: beautify.bind(null, update),
		moveCommit: moveCommit.bind(null, update),
		renameCommit: renameCommit.bind(null, update)
	};
};

export const commits = createCommitsStore();
