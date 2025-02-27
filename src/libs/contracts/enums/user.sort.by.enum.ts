import { z } from 'zod';

export const usersSortBy = z.enum(['createdAt', 'login', 'email']);
export type UsersSortByEnum = z.infer<typeof usersSortBy>;
export const UsersSortByValues = usersSortBy.options;
