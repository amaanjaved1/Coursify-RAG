/**
 * Deterministic checks for resolveIntent. Run: npm run test:intent
 */
import { resolveIntent } from "../services/intent/intentService";

const TEST_QUERIES: string[] = [
  "Is CISC 121 hard?",
  "Average grade for CISC 121",
  "What do people think about CISC 121?",
  "Is Prof Smith good?",
  "CISC 121 vs CISC 124",
  "Easy electives at Queen's?",
  "Fail rate for CHEM 112?",
  "What is the GPA breakdown in PHYS 104?",
  "Is this course manageable if I work part time?",
  "Professor Lee teaching quality for MATH 110",
  "Student reviews and opinions on cisc121",
  "Which is easier, CHEM 112 or PHYS 104?",
  "Compare CISC121 and CISC 124 workload",
  "What courses should I take first year?",
  "Is the teaching style harsh in this department?",
  "What do students say about the midterm?",
  "I need general advice picking electives",
  "MARK distribution for ECON 110 last year",
];

function main(): void {
  console.log("=== Intent classification — resolveIntent() ===\n");

  TEST_QUERIES.forEach((query, index) => {
    const result = resolveIntent(query);
    console.log(`#${String(index + 1).padStart(2, "0")}  Query: ${query}`);
    console.log(JSON.stringify(result, null, 2));
    console.log("");
  });

  console.log(`Total cases: ${TEST_QUERIES.length}`);
}

main();
