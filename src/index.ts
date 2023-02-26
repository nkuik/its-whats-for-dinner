import { Fall, Season, Spring, Summer, Winter } from "./types/ingredients";

export const findSeason = async (dateObj: Date): Promise<Season> => {
  if (Spring.firstDay <= dateObj && dateObj < Summer.firstDay) {
    return Spring;
  } else if (Summer.firstDay <= dateObj && dateObj < Fall.firstDay) {
    return Summer;
  } else if (Fall.firstDay <= dateObj && dateObj < Winter.firstDay) {
    return Fall;
  }
  return Winter;
};
