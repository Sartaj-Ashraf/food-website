"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceAreaFormDialogProps } from "@/app/types/serviceAreas";

export default function ServiceAreaFormDialog({
  openDialog,
  setOpenDialog,
  editServiceArea,
  handleFormSubmit,
  form,
  setForm,
}: ServiceAreaFormDialogProps) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editServiceArea ? "Edit Service Area" : "New Service Area"}
          </DialogTitle>
          <DialogDescription>
            {editServiceArea ? "Update service area details." : "Add a new service area."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Address</label>
            <Input
              value={form.address}
              required
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Service area address"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Coordinates</label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                placeholder="Longitude"
                required
                value={form.location.coordinates[0]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: {
                      ...f.location,
                      coordinates: [
                        parseFloat(e.target.value) || 0,
                        f.location.coordinates[1],
                      ],
                    },
                  }))
                }
              />
              <Input
                type="number"
                step="any"
                placeholder="Latitude"
                required
                value={form.location.coordinates[1]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: {
                      ...f.location,
                      coordinates: [
                        f.location.coordinates[0],
                        parseFloat(e.target.value) || 0,
                      ],
                    },
                  }))
                }
              />
            </div>
            
          </div>
          <div>
  <label className="block mb-1 text-sm font-medium">Delivery Radius (km)</label>
  <input
    type="number"
    min={0}
    step={0.1}
    required
    value={form.deliveryRadius ?? 5}
    onChange={(e) =>
      setForm((f) => ({
        ...f,
        deliveryRadius: Math.max(0, parseFloat(e.target.value) || 0),
      }))
    }
    className="border rounded px-2 py-1 w-full"
    placeholder="Enter delivery radius in kilometers"
  />
</div>
          <Button type="submit" className="w-full">
            {editServiceArea ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
