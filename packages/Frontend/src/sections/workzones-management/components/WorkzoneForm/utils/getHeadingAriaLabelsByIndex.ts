const headingsAriaLabels = [
  "North to North North East",
  "North North East to North East",
  "North East to East North East",
  "East North East to East",
  "East to East South East",
  "East South East to South East",
  "South East to South South East",
  "South South East to South",
  "South to South South West",
  "South South West to South West",
  "South West to West South West",
  "West South West to West",
  "West to North West North",
  "North West North to North West",
  "North West to North North West",
  "North North West to North",
];

export const getHeadingAriaLablesByIndex = (index: number): string => {
  return headingsAriaLabels[index] || '' ;
};
