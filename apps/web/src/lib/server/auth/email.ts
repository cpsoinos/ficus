import { eq, sql } from 'drizzle-orm/sql';

import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const [row] = await db
		.select({ count: sql<number>`cast(count(${usersTable.id}) as int)` })
		.from(usersTable)
		.where(eq(usersTable.email, email))
		.execute();
	if (row === null) {
		throw new Error();
	}
	return row.count === 0;
}
