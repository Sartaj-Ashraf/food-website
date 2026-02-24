"use client";
import { useEffect, useState } from "react";
import { Download, Filter } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import ContactQueriesFilters from "./components/ContactQueriesFilters";
import ContactQueriesTable from "./components/ContactQueriesTable";
import PaginationComponent from "@/components/shared/Pagination";

import { Pagination } from "@/app/types/pagination";
import { ContactQuery } from "@/app/types/contactQuery";

import { customFetch } from "@/utils/customFetch";

export default function ContactQueriesHomePage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "name" | "name-desc"
  >("newest");

  const { toast } = useToast();

  // Fetch function with unified pagination
  const fetchContactQueries = async (page = pagination.currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        sortBy,
      });

      const { data } = await customFetch.get(`/queries?${params}`);
      console.log({ data });

      setQueries(data.contacts || []);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalDocs: data.totalDocs,
        hasNext: data.currentPage < data.totalPages,
        hasPrev: data.currentPage > 1,
      });
    } catch (err) {
      toast({
        title: "Failed to fetch contact queries",
        variant: "destructive",
      });
      setQueries([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalDocs: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch triggered on filters/sort changes (reset page to 1)
  useEffect(() => {
    fetchContactQueries(1);
  }, [search, startDate, endDate, sortBy]);

  // Fetch triggered on page change
  useEffect(() => {
    fetchContactQueries(pagination.currentPage);
  }, [pagination.currentPage]);

  // Export handler
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: "xlsx",
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        sortBy,
      });
      const url = `/queries/export?${params}`;
      const { data } = await customFetch.get(url, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const filename = `contacts-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Exported to Excel",
        description: "File downloaded",
        variant: "default",
      });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  // Reset all filters and page
  const resetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Page change handler updates the pagination state
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Query Management</h1>
          <p className="text-muted-foreground">
            View and manage customer contact requests
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export XLSX
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactQueriesFilters
            search={search}
            setSearch={setSearch}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            sortBy={sortBy}
            setSortBy={(value) => setSortBy(value as any)}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Queries ({pagination.totalDocs})</CardTitle>
          <CardDescription>
            Showing {queries.length} of {pagination.totalDocs} queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactQueriesTable
            queries={queries}
            loading={loading}
            fetchQueries={fetchContactQueries}
          />

          {/* Shared Pagination component below table */}
          <PaginationComponent
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
