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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ServiceAreaTable from "./components/ServiceAreaTable";
import ServiceAreaFormDialog from "./components/ServiceAreaFormDialog";
import MapboxMap from "./components/ServiceAreaMap"; // Using your Map component here
import { customFetch } from "@/utils/customFetch";

export default function AdminServiceAreasPage() {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editServiceArea, setEditServiceArea] = useState(null);
  const [showMap, setShowMap] = useState(false); // New state to toggle map view

  const [form, setForm] = useState({
    address: "",
    location: { type: "Point", coordinates: [0, 0] },
    isActive: true,
    deliveryRadius: 5,
  });

  const { toast } = useToast();

  const fetchServiceAreas = async () => {
    setLoading(true);
    try {
      const res = await customFetch.get("/serviceAreas/all");
      setServiceAreas(res.data || []);
    } catch {
      setServiceAreas([]);
      toast({ title: "Failed to fetch service areas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const handleFormSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (editServiceArea && editServiceArea._id) {
        await customFetch.put(`/serviceAreas/${editServiceArea._id}`, {
          address: form.address,
          coordinates: form.location.coordinates,
          deliveryRadius: form.deliveryRadius,
          isActive: form.isActive,
        });
        toast({ title: "Service area updated" });
      } else {
        await customFetch.post("/serviceAreas", {
          address: form.address,
          coordinates: form.location.coordinates,
          deliveryRadius: form.deliveryRadius,
          isActive: form.isActive,
        });
        toast({ title: "Service area created" });
      }
      setOpenDialog(false);
      setEditServiceArea(null);
      fetchServiceAreas();
      setForm({
        address: "",
        location: { type: "Point", coordinates: [0, 0] },
        isActive: true,
        deliveryRadius: 5,
      });
    } catch {
      toast({ title: "Error: Could not save service area", variant: "destructive" });
    }
  };

  function openEditDialog(area) {
    setEditServiceArea(area);
    setForm({
      address: area.address,
      location: area.location,
      deliveryRadius: area.deliveryRadius,
      isActive: area.isActive,
    });
    setOpenDialog(true);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Areas</h1>
          <p className="text-muted-foreground">
            Manage the areas your company serves. Add, update, toggle, or delete service areas displayed on your site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => {
              setEditServiceArea(null);
              setForm({
                address: "",
                location: { type: "Point", coordinates: [0, 0] },
                deliveryRadius: 5,
                isActive: true,
              });
              setOpenDialog(true);
              setShowMap(false); // Hide map when opening form
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>

          <Button
            variant={showMap ? "secondary" : "default"}
            onClick={() => setShowMap((prev) => !prev)}
          >
            {showMap ? "Hide Map" : "View All on Map"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Areas ({serviceAreas.length})</CardTitle>
          <CardDescription>All service areas added.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceAreaTable
            serviceAreas={serviceAreas}
            loading={loading}
            openEditDialog={openEditDialog}
            fetchServiceAreas={fetchServiceAreas}
          />
        </CardContent>
      </Card>

      {showMap && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Radius Map</CardTitle>
            <CardDescription>View delivery radius for all service areas.</CardDescription>
          </CardHeader>
          <CardContent>
            <MapboxMap serviceAreas={serviceAreas} height="500px" />
          </CardContent>
        </Card>
      )}

      <ServiceAreaFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        editServiceArea={editServiceArea}
        handleFormSubmit={handleFormSubmit}
        form={form}
        setForm={setForm}
      />
    </div>
  );
}
