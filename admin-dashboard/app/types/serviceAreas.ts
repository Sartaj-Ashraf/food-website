export interface ServiceArea {
    _id?: string;
    address: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
    isActive: boolean;
    deliveryRadius?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  
  export interface ServiceAreaFormDialogProps {
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
    editServiceArea: ServiceArea | null;
    handleFormSubmit: (e: React.FormEvent) => void;
    form: Omit<ServiceArea, "_id" | "createdAt" | "updatedAt">;
    setForm: React.Dispatch<
      React.SetStateAction<Omit<ServiceArea, "_id" | "createdAt" | "updatedAt">>
    >;
  }
  