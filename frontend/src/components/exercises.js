import axios from "axios";

export const markExerciseComplete = async (username, planId, exercise) => {
  return axios.post("/workouts/exercises/mark-complete", {
    username: username,
    plan_id: planId,
    exercise_id: exercise.exercise_id,
    day_index: exercise.day_index,
    exerciseType: exercise.activity,
    subActivity: exercise.sub_activity || "",
    duration: exercise.minutes,
    description: exercise.description || ""
  });
};
