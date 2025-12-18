// export function useVolunteerHistory(userId?: number) {
//   return useQuery<VolunteerHistoryItem[]>({
//     queryKey: ['volunteer-history', userId],
//     enabled: typeof userId === 'number' && !Number.isNaN(userId),
//     queryFn: () => fetchMyVolunteerHistory(userId as number),
//     staleTime: 60_000,
//   });
// }

// export function useFreecycleHistory(userId?: number) {
//   return useQuery<VolunteerHistoryItem[]>({
//     queryKey: ['freecycle-history', userId],
//     enabled: typeof userId === 'number' && !Number.isNaN(userId),
//     queryFn: () => fetchMyFreecycleHistory(userId as number),
//     staleTime: 60_000,
//   });
// }
