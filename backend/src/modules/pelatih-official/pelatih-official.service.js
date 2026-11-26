import { getPelatihOfficialList } from "./pelatih-official.repository.js";

export const fetchPelatihOfficial = async (query = {}) => {
  return getPelatihOfficialList(query);
};