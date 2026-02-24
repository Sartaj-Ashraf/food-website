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

import { ContactQuery } from "@/app/types/contactQuery";
import { customFetch } from "@/utils/customFetch";

export default function ContactQueriesTable({
  queries,
  loading,
  fetchQueries,
}: {
  queries: ContactQuery[];
  loading: boolean;
  fetchQueries: () => void;
}) {
  const { toast } = useToast();
  const handleDelete = async (queryId: string) => {
    try {
      const { data } = await customFetch.delete(`/queries/${queryId}`);
      console.log({datatoDelete:data});
      if (data?.success) {
        toast({
          title: "Success",
          description: "Contact query deleted successfully",
        });
        fetchQueries();
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to delete contact query",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact query",
        variant: "destructive",
      });
    }
  };
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : queries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No queries found.
                </TableCell>
              </TableRow>
            ) : (
              queries.map((query) => (
                <TableRow key={query._id}>
                  <TableCell>
                    <span className="font-medium">{query.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{query.phoneNumber}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-pre-line truncate">
                    {query.message}
                  </TableCell>
                  <TableCell>
                    {format(new Date(query.createdAt), "dd MMM yyyy, hh:mm a")}
                  </TableCell>
                  <TableCell>
                    {/* <AlertDialog
                      open={deleteDialogOpen && queryToDelete?._id === query._id}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQueryToDelete(query);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete This Query?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete the query from <b>{query.name}</b>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                    <DeleteConfirmationModal
                      item={query}
                      handleDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
