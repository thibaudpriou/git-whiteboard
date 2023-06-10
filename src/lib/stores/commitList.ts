import type { CommitWithParents } from '$types';
import { commits } from './commits';
import { derived } from 'svelte/store';
import { getObjectProperty } from '$lib/utils';

export const commitList = derived(commits, ($map) => {
    const commits = Object.values($map.idMap)

    const withParents =  commits.map(c => {
        const parentsCommits = c.parents.map(p => {
            const parent = getObjectProperty($map.idMap, p)
            if (!parent) throw new Error('parent not found: ' + p)
            
            return parent
        })

        return {
            ...c,
            parentsCommits
        } as CommitWithParents
    })

    return withParents
})