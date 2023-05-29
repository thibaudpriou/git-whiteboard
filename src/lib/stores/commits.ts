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
	return update((s) => {
		const doesPosExists = Object.values(s.idMap).some(
			(c) => c.pos.x === commit.pos.x && c.pos.y === commit.pos.y
		);

		if (doesPosExists) return s;

		const id = uuidv4();

		const idMap = {
			...s.idMap,
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
		}, s.childrenMap);

		return {
			...s,
			idMap,
			childrenMap: childrenMap ?? s.childrenMap
		};
	});
};

const beautify = (update: UpdateFn) => {
	return update((s) => {
		return {
			...s,
			idMap: beautifyCommitsPositions(s.idMap, s.childrenMap)
		};
	});
};

const deleteCommit = (update: UpdateFn, id: Commit['id']) => {
	return update((s) => {
		const idMap = { ...s.idMap };
		const childrenMap = { ...s.childrenMap };

		const commit = getObjectProperty(idMap, id);

		// del commit
		delete idMap[id];

		// del parent->commit
		commit?.parents?.forEach((p) => {
			const parentChildren = getObjectProperty(childrenMap, p);
			if (!parentChildren) return;

			childrenMap[p] = parentChildren.filter((c) => c.id === id);
		});

		// del commit->children
		const children = getObjectProperty(childrenMap, id);
		children?.forEach((c) => {
			const childCommit = getObjectProperty(idMap, c.id);
			if (!childCommit) return;

			const childParents =
				childCommit.parents && (childCommit.parents.filter((p) => p !== id) as Commit['parents']);

			idMap[c.id] = {
				...childCommit,
				parents: childParents
			};
		});
		delete childrenMap[id];

		return {
			...s,
			idMap,
			childrenMap
		};
	});
};

const moveCommit = (update: UpdateFn, id: Commit['id'], pos: Commit['pos']) => {
	return update((s) => {
		const commit = getObjectProperty(s.idMap, id);
		if (!commit) return s;

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

		const childrenIds = getAllFirstChildren(s.childrenMap, [id]);
		const toTranslate = [id, ...childrenIds];

		return {
			...s,
			idMap: toTranslate.reduce((map, i) => {
				const c = getObjectProperty(map, i);
				if (!c) return map; // shouldn't happen

				return {
					...map,
					[i]: translate(c)
				};
			}, s.idMap)
		};
	});
};

const renameCommit = (update: UpdateFn, commit: Commit, name: string) => {
	return update((s) => {
		const found = getObjectProperty(s.idMap, commit.id);
		if (!found) return s;

		return {
			...s,
			idMap: {
				...s.idMap,
				[found.id]: {
					...found,
					name
				}
			}
		};
	});
};

const removeParents = (update: UpdateFn, id: Commit['id']) => {
	return update((s) => {
		const found = getObjectProperty(s.idMap, id);
		if (!found) return s;

		const newIdMap = { ...s.idMap };
		newIdMap[id] = {
			...found,
			parents: null
		};

		const newChildrenMap = { ...s.childrenMap };
		found.parents?.forEach((p) => {
			const parent = getObjectProperty(newChildrenMap, id);
			if (!parent) throw new Error('parent not found in children map');

			newChildrenMap[p] = s.childrenMap[p].filter((child) => child.id !== id);
		});

		return {
			...s,
			idMap: newIdMap,
			childrenMap: newChildrenMap
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
		delete: deleteCommit.bind(null, update),
		moveCommit: moveCommit.bind(null, update),
		removeParents: removeParents.bind(null, update),
		renameCommit: renameCommit.bind(null, update)
	};
};

export const commits = createCommitsStore();
