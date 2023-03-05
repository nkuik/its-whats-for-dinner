export type Season = "winter" | "autumn" | "spring" | "summer";

export const findSeason = async (dateObj: Date): Promise<Season> => {
  const firstDaySpring = new Date(`${dateObj.getFullYear()}-04-20`);
  const firstDaySummer = new Date(`${dateObj.getFullYear()}-06-21`);
  const firstDayAutumn = new Date(`${dateObj.getFullYear()}-09-23`);
  const firstDayWinter = new Date(`${dateObj.getFullYear()}-12-21`);
  if (firstDaySpring <= dateObj && dateObj < firstDaySummer) {
    return "spring";
  } else if (firstDaySummer <= dateObj && dateObj < firstDayAutumn) {
    return "summer";
  } else if (firstDayAutumn <= dateObj && dateObj < firstDayWinter) {
    return "autumn";
  }
  return "winter";
};
