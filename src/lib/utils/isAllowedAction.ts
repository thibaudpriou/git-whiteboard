import { ActionType } from "$lib/constants"

/**
 * Check whether given string is an ActionType value
 *
 * @param str 
 * @returns
 */
export const isAllowedAction = (str: string | ActionType): str is ActionType => {
    const allowedActions = Object.values(ActionType) as string[]
    return allowedActions.includes(str)
}
