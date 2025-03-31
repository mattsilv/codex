export default {
  schema: "./src/backend/db/schema.js",
  out: "./migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./.wrangler/state/d1/DB/db.sqlite",
  },
};