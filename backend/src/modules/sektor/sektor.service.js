import { getSektors } from "./sektor.repository.js";

export const fetchSektors = async () => {
  return getSektors();
};