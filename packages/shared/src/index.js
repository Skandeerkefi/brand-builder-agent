/** @typedef {{ id: string; name: string; createdAt: string }} Project */

export const APP_NAME = "Brand Builder Dashboard";

/**
 * Validates that an object has the required Project fields.
 * @param {unknown} obj
 * @returns {boolean}
 */
export function isValidProject(obj) {
  return (
    obj != null &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.createdAt === "string"
  );
}
