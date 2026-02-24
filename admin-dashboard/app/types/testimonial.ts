export interface Testimonial {
  _id?: string;
  name: string;
  review: string;
  rating: number;
  createdAt?: string;
  source: string;
  sourceLink?: string;
  isFeatured?: boolean;
}

export interface TestimonialFormDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  editTestimonial: Testimonial | null;
  handleFormSubmit: (e: React.FormEvent) => void;
  form: Omit<Testimonial, "_id" | "createdAt">;
  setForm: React.Dispatch<
    React.SetStateAction<Omit<Testimonial, "_id" | "createdAt">>
  >;
}
