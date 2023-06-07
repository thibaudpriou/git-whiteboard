import { getObjectProperty, getAllFirstChildren } from '$lib/utils';
import type { UpdateFn, Commit, CommitsStore } from '$types';

export const moveCommit = (
	update: UpdateFn<CommitsStore>,
	id: Commit['id'],
	pos: Commit['pos']
) => {
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
