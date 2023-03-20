export const calculateWeekNumber = async (
  dateObject: Date,
): Promise<number> => {
  const startDate = new Date(dateObject.getFullYear(), 0, 1);
  const days = Math.floor(
    (dateObject.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil(days / 7);
};

export const buildYearWeek = async (dateObject: Date): Promise<string> => {
  return `${dateObject.getFullYear()}-${await calculateWeekNumber(dateObject)}`;
};

export const getPreviousYearWeek = async (
  dateObject: Date,
): Promise<string> => {
  return buildYearWeek(
    new Date(
      dateObject.getFullYear(),
      dateObject.getMonth(),
      dateObject.getDate() - 7,
    ),
  );
};
