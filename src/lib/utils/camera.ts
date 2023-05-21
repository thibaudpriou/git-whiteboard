import { ActionType, CameraMotion } from '$lib/constants';

import type { Pos3D } from '../../types';

const getTranslationVector = (motion: CameraMotion): Pos3D => {
	const motionless = { x: 0, y: 0, z: 0 };
	switch (motion) {
		case CameraMotion.UP:
			return { ...motionless, y: 1 };
		case CameraMotion.DOWN:
			return { ...motionless, y: -1 };
		case CameraMotion.LEFT:
			return { ...motionless, x: -1 };
		case CameraMotion.RIGHT:
			return { ...motionless, x: 1 };
		case CameraMotion.UPWARD:
			return { ...motionless, z: -1 };
		case CameraMotion.BACKWARD:
			return { ...motionless, z: 1 };
		default:
			throw new Error('Unknown camera motion: ' + motion);
	}
};

/**
 * Return the new camera position after given motion
 *
 * @param motion
 * @param camera the camera position
 * @returns new camera position
 */
export const moveCamera = (motion: CameraMotion, camera: Pos3D): Pos3D => {
	const translation = getTranslationVector(motion);

	const x = camera.x + translation.x;
	const y = camera.y + translation.y;
	const z = camera.z + translation.z;
	return {
		x,
		y,
		z: Math.max(1, z) // camera can't go through
	};
};

/**
 * Return corresponding camera motion given key action
 *
 * @param action key pressed
 * @param isDolly whether the camera moves upward or backward
 * @returns
 */
export const keyActionToCameraMotion = (
	action: 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | string,
	isDolly: boolean
): CameraMotion | undefined => {
	if (isDolly) {
		switch (action) {
			case 'ArrowUp':
				return CameraMotion.UPWARD;
			case 'ArrowDown':
				return CameraMotion.BACKWARD;
			default:
				return undefined;
		}
	}

	// here we invert keys & motions for intuitive UX
	switch (action) {
		case 'ArrowUp':
			return CameraMotion.DOWN;
		case 'ArrowDown':
			return CameraMotion.UP;
		case 'ArrowLeft':
			return CameraMotion.RIGHT;
		case 'ArrowRight':
			return CameraMotion.LEFT;
		default:
			return undefined;
	}
};
