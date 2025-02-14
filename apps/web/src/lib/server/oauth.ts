import { GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { db } from './db';
import { oAuthAccountsTable, type OAuthAccount } from './db/schema';
import { eq } from 'drizzle-orm';

export enum OAuthProvider {
	GITHUB = 'github'
}

export const getOAuthProviderName = (provider: OAuthProvider): string => {
	switch (provider) {
		case OAuthProvider.GITHUB:
			return 'GitHub';
	}
};

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);

export async function getOAuthAccountsForUser(userId: string): Promise<OAuthAccount[]> {
	const rows = await db.query.oAuthAccountsTable.findMany({
		where: eq(oAuthAccountsTable.userId, userId)
	});
	return rows;
}
