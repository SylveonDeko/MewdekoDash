import type {PageServerLoad} from "./$types"

export const load: PageServerLoad =  async ({url}): Promise<{code: string | null}> =>
  ({code: url.searchParams.get("code") ?? null})
