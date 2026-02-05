import {
  AdminAlertDialog,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogDescription,
  AdminAlertDialogTitle,
  AdminAlertDialogTrigger,
} from "@/components/admin/ui/AdminDialog";
import AdminButton from "@/components/admin/ui/AdminButton";

export type DeleteDialogProps = {
  onConfirm: () => void;
  children: React.ReactNode;
};

export const DeleteDialog = ({ onConfirm, children }: DeleteDialogProps) => {
  return (
    <AdminAlertDialog>
      <AdminAlertDialogTrigger asChild>{children}</AdminAlertDialogTrigger>
      <AdminAlertDialogContent>
        <AdminAlertDialogTitle>Confirm delete</AdminAlertDialogTitle>
        <AdminAlertDialogDescription>
          Bạn chắc chắn muốn xoá? Thao tác này không thể hoàn tác.
        </AdminAlertDialogDescription>
        <div className="mt-4 flex justify-end gap-3">
          <AdminAlertDialogCancel asChild>
            <AdminButton variant="outline">Cancel</AdminButton>
          </AdminAlertDialogCancel>
          <AdminAlertDialogAction asChild>
            <AdminButton onClick={onConfirm}>Delete</AdminButton>
          </AdminAlertDialogAction>
        </div>
      </AdminAlertDialogContent>
    </AdminAlertDialog>
  );
};
