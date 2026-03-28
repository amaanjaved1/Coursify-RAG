export async function searchSimilar(query: string): Promise<string[]> {
  const q = query.slice(0, 80);
  return [
    `[RMP mock] Students mention "${q}" — mixed reviews; several note coding-heavy assignments.`,
    `[Reddit mock] Thread: workload is manageable if you start projects early; midterm was fair.`,
    `[RMP mock] Advice: go to office hours; TAs were helpful for the final project.`,
  ];
}
