import * as z from 'zod';

const ReportFromSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  image_url: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .nullable(),
  description: z.string().min(5).max(1000).nullable(),
  location: z.any().nullable().optional(),
  ambulance_service: z.boolean().nullable(),
  contact_center_service: z.boolean().nullable().optional(),
  level: z
    .enum(['near_miss', 'minor', 'moderate', 'major', 'lethal'])
    .nullable(),
  status: z.enum(['pending', 'resolved', 'verified']).nullable(),
  title: z.string().min(1).optional(),
  report_category: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ReportOmit = ReportFromSchema.omit({
  id: true,
  level: true,
  status: true,
  created_at: true,
  updated_at: true,
});

const ReportResponseMannySchema = z.object({
  report: z.array(ReportFromSchema),
});

export type ReportRequestFrom = z.infer<typeof ReportOmit>;
export type ReportResponseFrom = z.infer<typeof ReportFromSchema>;
export type ReportResponseManny = z.infer<typeof ReportResponseMannySchema>;
