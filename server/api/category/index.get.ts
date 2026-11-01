import { db } from "~~/server/database/connection";
import { category } from "~~/server/database/schemas/category.schema";

export default defineDbHandler(async () => {
  const categories = db.select().from(category);
  return categories;
})
