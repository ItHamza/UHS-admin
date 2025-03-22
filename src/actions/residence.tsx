import { getResidences } from "@/lib/service/residence";

export default async function ResidenceAction() {
  const residence = await getResidences();
  return residence.data;
}
