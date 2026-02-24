"use client";
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ServiceArea } from "@/app/types/serviceAreas";
import { customFetch } from "@/utils/customFetch";
import { Edit, Trash2, CheckCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function ServiceAreaTable({
  serviceAreas,
  loading,
  openEditDialog,
  fetchServiceAreas,
}: {
  serviceAreas: ServiceArea[];
  loading: boolean;
  openEditDialog: (area: ServiceArea) => void;
  fetchServiceAreas: () => void;
}) {
  const { toast } = useToast();

  // State to track which area to toggle and modal visibility
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [pendingToggleArea, setPendingToggleArea] = useState<ServiceArea | null>(null);

  // Confirmed toggle handler
  const confirmToggleActive = async () => {
    if (!pendingToggleArea) return;
    try {
      await customFetch.put(`/serviceAreas/${pendingToggleArea._id}/toggle`);
      toast({ title: "Toggled active state" });
      fetchServiceAreas();
    } catch {
      toast({ title: "Failed to toggle active state", variant: "destructive" });
    } finally {
      setPendingToggleArea(null);
      setToggleModalOpen(false);
    }
  };

  // Delete with confirmation
  const handleDelete = async (area: ServiceArea) => {
    if (!area) return;
    try {
      await customFetch.delete(`/serviceAreas/${area._id}`);
      toast({ title: "Service area deleted" });
      fetchServiceAreas();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  // Opens toggle confirmation modal
  const openToggleModal = (area: ServiceArea) => {
    setPendingToggleArea(area);
    setToggleModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
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
            ) : serviceAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No service areas found.
                </TableCell>
              </TableRow>
            ) : (
              serviceAreas.map((area) => (
                <TableRow key={area._id}>
                  <TableCell className="font-semibold">{area.address}</TableCell>
                  <TableCell>
                    {area.location?.coordinates[0]}, {area.location?.coordinates[1]}
                  </TableCell>
                  <TableCell>
                    {area.isActive ? (
                      <Badge variant="default">
                        <CheckCircle className="inline-block w-4 h-4 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <MinusCircle className="inline-block w-4 h-4 mr-1" /> Inactive
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openToggleModal(area)}
                    >
                      change
                    </Button>
                  </TableCell>
                  <TableCell>
                    {area.createdAt ? format(new Date(area.createdAt), "PP p") : "--"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(area)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DeleteConfirmationModal item={area} handleDelete={() => handleDelete(area)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Toggle Confirmation Modal */}
      <ConfirmationModal
        open={toggleModalOpen}
        setOpen={setToggleModalOpen}
        title="Confirm Toggle"
        description={`Are you sure you want to ${pendingToggleArea?.isActive ? "deactivate" : "activate"
          } this service area?`}
        onConfirm={confirmToggleActive}
      />
    </>
  );
}
