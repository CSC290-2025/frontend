import { useMutation } from '@tanstack/react-query';
import { createVolunteerEvent } from '../api/volunteer.api';

export function useCreateVolunteer() {
  return useMutation({
    mutationFn: createVolunteerEvent,
  });
}
