import { syncRemotiveJobs } from "../src/server/services/job-ingestion";
import { prisma } from "../src/db/prisma";

syncRemotiveJobs()
  .then((result) => console.log(`Job ingestion complete: ${result.imported} ${result.provider} listings upserted, ${result.expired} expired.`))
  .catch((error) => { console.error(`Job ingestion failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
