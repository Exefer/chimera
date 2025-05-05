export const constructGameUrl = (id: string, title: string) => {
  const searchParams = new URLSearchParams({
    id,
    title,
  });

  return `/game-details?${searchParams.toString()}`;
};
