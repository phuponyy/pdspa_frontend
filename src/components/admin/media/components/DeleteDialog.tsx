import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type DeleteDialogProps = {
  onConfirm: () => void;
  children: React.ReactNode;
};

export const DeleteDialog = ({ onConfirm, children }: DeleteDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Confirm delete</AlertDialogTitle>
        <AlertDialogDescription>
          Bạn chắc chắn muốn xoá? Thao tác này không thể hoàn tác.
        </AlertDialogDescription>
        <div className="mt-4 flex justify-end gap-3">
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>Delete</Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
