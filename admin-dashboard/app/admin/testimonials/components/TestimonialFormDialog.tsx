"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TestimonialFormDialogProps } from "@/app/types/testimonial";

import { SOURCES } from "@/utils/testimonialSources";

export default function TestimonialFormDialog({
  openDialog,
  setOpenDialog,
  editTestimonial,
  handleFormSubmit,
  form,
  setForm,
}: TestimonialFormDialogProps) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTestimonial ? "Edit Testimonial" : "New Testimonial"}
          </DialogTitle>
          <DialogDescription>
            {editTestimonial
              ? "Update testimonial details."
              : "Add a user testimonial."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <Input
              value={form.name}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Customer Name"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Review</label>
            <Input
              value={form.review}
              required
              onChange={(e) =>
                setForm((f) => ({ ...f, review: e.target.value }))
              }
              placeholder="Testimonial Message"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Rating</label>
            <Input
              value={form.rating}
              required
              type="number"
              min={1}
              max={5}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rating: Math.max(1, Math.min(5, Number(e.target.value))),
                }))
              }
              placeholder="1-5"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Source</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={form.source}
              onChange={(e) =>
                setForm((f) => ({ ...f, source: e.target.value }))
              }
              required
            >
              {SOURCES.map((s) => (
                <option value={s.value} key={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Source Link (if any)
            </label>
            <Input
              value={form.sourceLink || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, sourceLink: e.target.value }))
              }
              placeholder="URL"
            />
          </div>
          {/* Optionally, featured */}
          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={!!form.isFeatured}
              onChange={(e) =>
                setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))
              }
              id="feat"
            />
            <label htmlFor="feat" className="text-sm">
              Featured
            </label>
          </div>
          <Button type="submit" className="w-full">
            {editTestimonial ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
