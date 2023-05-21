/**
 * Return a new array without given element
 *
 * @param array array
 * @param el the element to remove
 * @returns a new array
 */
export const removeArrayEl = <T>(array: T[], el: T): T[] => {
	return array.filter((e) => e !== el);
};

