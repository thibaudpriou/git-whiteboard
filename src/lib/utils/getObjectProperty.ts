/**
 * Return object property of given key
 * @param obj
 * @param key
 * @returns
 */
export const getObjectProperty = <T>(
	obj: Record<string, T>,
	key: string | number
): T | undefined => {
	return obj[key];
};
