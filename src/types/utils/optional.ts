/**
 * @description marks one or more field as optional
 */

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
