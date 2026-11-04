import { ensureIndexes } from "@/lib/db/indexes";

ensureIndexes()
  .then(() => {
    console.log("Indexes ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
