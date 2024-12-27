import { eq, sql } from 'drizzle-orm/sql';
import { db } from './db';
import { user } from './db/schema';

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const [row] = await db
		.select({ count: sql<number>`cast(count(${user.id}) as int)` })
		.from(user)
		.where(eq(user.email, email))
		.execute();
	if (row === null) {
		throw new Error();
	}
	return row.count === 0;
}
