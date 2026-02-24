"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import TestimonialTable from "./components/TestimonialTable";
import TestimonialFormDialog from "./components/TestimonialFormDialog";
import PaginationComponent from "@/components/shared/Pagination"; 

// Shared type file
import { Testimonial } from "@/app/types/testimonial";
import { Pagination } from "@/app/types/pagination";

import { customFetch } from "@/utils/customFetch";

export default function AdminTestimonialsPage() {
  // State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(
    null
  );
  // Form for create/edit
  const [form, setForm] = useState<Omit<Testimonial, "_id" | "createdAt">>({
    name: "",
    review: "",
    rating: 5,
    source: "google",
    sourceLink: "",
    isFeatured: false,
  });

  const { toast } = useToast();

  // --- Fetch testimonials
  const fetchTestimonials = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "8",
        ...(search && { search }),
      });
      const res = await customFetch.get(`/testimonials?${params}`);
      const data = await res.data;
      setTestimonials(data.testimonials || []);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalDocs: data.totalDocs,
        hasNext: data.currentPage < data.totalPages,
        hasPrev: data.currentPage > 1,
      });
    } catch (err) {
      setTestimonials([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalDocs: 0,
        hasNext: false,
        hasPrev: false,
      });
      toast({ title: "Failed to fetch testimonials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(1);
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => {
    fetchTestimonials(pagination.currentPage);
    // eslint-disable-next-line
  }, [pagination.currentPage]);

  // --- Create / Update form submit
  const handleFormSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    try {
      if (editTestimonial) {
        // Edit mode
        await customFetch.patch(`/testimonials/${editTestimonial._id}`, form);
        toast({ title: "Testimonial updated" });
      } else {
        // Create mode
        await customFetch.post("/testimonials", form);
        toast({ title: "Testimonial created" });
      }
      setOpenDialog(false);
      setEditTestimonial(null);
      fetchTestimonials();
      setForm({
        name: "",
        review: "",
        rating: 5,
        source: "google",
        sourceLink: "",
        isFeatured: false,
      });
    } catch {
      toast({
        title: "Error: Could not save testimonial",
        variant: "destructive",
      });
    }
  };

  // --- Utilities
  function openEditDialog(testimonial: Testimonial) {
    setEditTestimonial(testimonial);
    setForm({
      name: testimonial.name,
      review: testimonial.review,
      rating: testimonial.rating,
      source: testimonial.source,
      sourceLink: testimonial.sourceLink,
      isFeatured: testimonial.isFeatured ?? false,
    });
    setOpenDialog(true);
  }

  // Pagination handler for table
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage, create, update, or delete testimonials shown on your site.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => {
            setEditTestimonial(null);
            setForm({
              name: "",
              review: "",
              rating: 5,
              source: "google",
              sourceLink: "",
              isFeatured: false,
            });
            setOpenDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> New
        </Button>
      </div>
      {/* --- Search --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Testimonials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTestimonials(1);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Search name or review..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[200px]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearch("")}
            >
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* --- Table --- */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials ({pagination.totalDocs})</CardTitle>
          <CardDescription>
            Showing {testimonials.length} of {pagination.totalDocs} testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialTable
            fetchTestimonials={fetchTestimonials}
            testimonials={testimonials}
            loading={loading}
            openEditDialog={openEditDialog}
          />
          <PaginationComponent
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
      <TestimonialFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        editTestimonial={editTestimonial}
        handleFormSubmit={handleFormSubmit}
        form={form}
        setForm={setForm}
      />
    </div>
  );
}
