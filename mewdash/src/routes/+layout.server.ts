// routes/+layout.ts or +layout.server.ts

export async function load({ locals }) {
  return {
    guilds: locals.guilds, user: locals.user
  };
}