import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmationModalProps {
  item: any;
  handleDelete: (itemId: string) => void;
  type?: "delete" | "restore";
}

const DeleteConfirmationModal = ({
  item,
  handleDelete,
  type = "delete",
}: DeleteConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);

  const confirmDelete = async () => {
    setLoading(true);
    try {
      handleDelete(item._id);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {type === "delete" && <Trash2 className="w-4 h-4" />}
          {type === "restore" && <RefreshCcw className="w-4 h-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "delete" ? "Delete" : "Restore"} {item.name}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {type === "delete" ? "delete" : "restore"}{" "}
            "{item.name}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : type === "delete" ? "Delete" : "Restore"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteConfirmationModal;
