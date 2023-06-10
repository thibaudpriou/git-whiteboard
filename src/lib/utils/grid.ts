import type { Pos, Pos3D } from '$types';

type Win = Pick<Window, 'innerHeight' | 'innerWidth'>;

/**
 * Compute grid size relative to camera distance
 *
 * @param maxSize
 * @param camera
 * @returns
 */
export const computeGridSize = (maxSize: number, camera: Pos3D) => {
	return (maxSize * 1) / camera.z;
};

/**
 * Compute canvas position given normalized position
 *
 * @param win
 * @param camera
 * @param gridSize
 * @param p
 * @returns
 */
export const getPositionFromGrid = (win: Win, camera: Pos3D, gridSize: number, p: Pos): Pos => {
	const { innerWidth: w, innerHeight: h } = win;

	return {
		x: w / 2 + gridSize * (p.x - camera.x),
		y: h / 2 + gridSize * (camera.y - p.y)
	};
};

/**
 * Compute normalized position given canvas position
 *
 * @param win
 * @param camera
 * @param gridSize
 * @param p
 * @returns
 */
export const getGridFromPosition = (win: Win, camera: Pos3D, gridSize: number, p: Pos): Pos => {
	const { innerWidth: w, innerHeight: h } = win;

	return {
		x: Math.round((p.x - w / 2) / gridSize + camera.x),
		y: Math.round((h / 2 - p.y) / gridSize + camera.y)
	};
};
