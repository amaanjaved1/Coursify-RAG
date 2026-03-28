import type { CourseStats, ProfessorRating } from "../../types";

export async function getCourseStats(_courseCode: string): Promise<CourseStats> {
  return {
    average: "B-",
    failRate: 0.12,
    sampleSize: 200,
  };
}

export async function getProfessorRatings(name: string): Promise<ProfessorRating> {
  return {
    name,
    overall: 4.2,
    difficulty: 3.1,
    wouldTakeAgain: 0.78,
    sampleSize: 45,
  };
}
