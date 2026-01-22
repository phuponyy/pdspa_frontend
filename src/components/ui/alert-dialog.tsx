"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils/cn";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogOverlay = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogOverlayProps) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out",
      className
    )}
    {...props}
  />
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export const AlertDialogContent = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#0f1722] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export const AlertDialogTitle = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description
    className={cn("text-sm text-white/70", className)}
    {...props}
  />
);
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

export const AlertDialogAction = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-full bg-[#ff9f40] px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] transition hover:bg-[#ffb454]",
      className
    )}
    {...props}
  />
);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export const AlertDialogCancel = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10",
      className
    )}
    {...props}
  />
);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
