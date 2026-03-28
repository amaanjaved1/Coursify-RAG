def get_course_stats(_course_code: str) -> dict[str, object]:
    return {
        "average": "B-",
        "failRate": 0.12,
        "sampleSize": 200,
    }


def get_professor_ratings(name: str) -> dict[str, object]:
    return {
        "name": name,
        "overall": 4.2,
        "difficulty": 3.1,
        "wouldTakeAgain": 0.78,
        "sampleSize": 45,
    }
