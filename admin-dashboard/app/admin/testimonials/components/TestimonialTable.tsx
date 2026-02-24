"use client";
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";

import { Testimonial } from "@/app/types/testimonial";
import { customFetch } from "@/utils/customFetch";

import { Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function TestimonialTable({
  testimonials,
  loading,
  openEditDialog,
  fetchTestimonials,
}: {
  testimonials: Testimonial[];
  loading: boolean;
  openEditDialog: (testimonial: Testimonial) => void;
  fetchTestimonials: () => void;
}) {
  const { toast } = useToast();
  // --- Delete
  const handleDelete = async (testimonial: Testimonial) => {
    if (!testimonial) return;
    try {
      await customFetch.delete(`/testimonials/${testimonial._id}`);
      toast({ title: "Testimonial deleted" });
      fetchTestimonials();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : testimonials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No testimonials found.
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-semibold">{t.name}</TableCell>
                  <TableCell className="max-w-xs whitespace-pre-line truncate">
                    {t.review}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-yellow-500 font-bold">
                      {t.rating} <Star className="ml-1 w-4 h-4" fill="gold" />
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.source}</Badge>
                    {t.sourceLink && (
                      <a
                        href={t.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 underline text-xs"
                      >
                        Link
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(t.createdAt!), "PP p")}
                  </TableCell>
                  <TableCell>
                    {t.isFeatured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(t)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DeleteConfirmationModal
                      item={t}
                      handleDelete={() => handleDelete(t)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
