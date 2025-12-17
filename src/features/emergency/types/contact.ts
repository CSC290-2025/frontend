import * as z from 'zod';

const phoneRegex = new RegExp(/^(0[689]{1})+([0-9]{8})+$/);
const ContactFromSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  contact_name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required').regex(phoneRegex, {
    message: 'Invalid phone number',
  }),
});

export const ContactOmit = ContactFromSchema.omit({
  id: true,
});

const ContactUpdateFromSchema = z.object({
  contact_name: z.string().nullable(),
  phone: z
    .string()
    .regex(phoneRegex, {
      message: 'Invalid phone number',
    })
    .nullable(),
});

export type ContactRequestFrom = z.infer<typeof ContactOmit>;
export type ContactResponseFrom = z.infer<typeof ContactFromSchema>;
export type ContactUpdateFrom = z.infer<typeof ContactUpdateFromSchema>;
