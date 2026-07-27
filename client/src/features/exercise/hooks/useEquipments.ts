import { useQuery } from "@tanstack/react-query";

import { getEquipments } from "../services/exercise.service";

export function useEquipments() {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: getEquipments,
    staleTime: Infinity,
  });
}