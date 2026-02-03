import { Button as UiButton } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type StatusBarProps = {
  mounted: boolean;
  status: "DRAFT" | "PUBLISHED";
  isSavingStatus: boolean;
  persistStatus: (nextStatus: "DRAFT" | "PUBLISHED") => void;
  discardChanges: () => void;
};

export default function StatusBar({
  mounted,
  status,
  isSavingStatus,
  persistStatus,
  discardChanges,
}: StatusBarProps) {
  return (
    <div
      id="status"
      className="sticky bottom-6 z-20 w-full flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0b1118]/90 px-5 py-3 text-xs text-white/70 shadow-[0_20px_60px_rgba(5,10,18,0.45)] backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </span>
        <span>Changes will be live instantly upon publishing.</span>
      </div>
      <div className="flex items-center gap-3">
        {mounted ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <UiButton variant="outline" size="sm">
                Discard
              </UiButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears your local draft and reloads the last saved version.
              </AlertDialogDescription>
              <div className="mt-5 flex items-center justify-end gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={discardChanges}>
                  Discard changes
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <UiButton
          size="sm"
          variant="outline"
          onClick={() => persistStatus("DRAFT")}
          disabled={isSavingStatus}
        >
          Save draft
        </UiButton>
        <UiButton
          size="sm"
          onClick={() => persistStatus("PUBLISHED")}
          disabled={isSavingStatus}
          className="bg-[#ff9f40] text-[#1a1410] shadow-[0_12px_24px_rgba(255,159,64,0.3)] hover:bg-[#ffb454]"
        >
          Publish page
        </UiButton>
      </div>
    </div>
  );
}
