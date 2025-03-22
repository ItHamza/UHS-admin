import { getAreas } from "@/lib/service/area";

export default async function AreaAction() {
  const areas = await getAreas();
  return areas.data;
}
