"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

export { Dialog as AdminDialog, DialogTrigger as AdminDialogTrigger };

export function AdminDialogContent(
  props: React.ComponentPropsWithoutRef<typeof DialogContent>
) {
  return (
    <DialogContent
      {...props}
      className={cn(
        "border-white/10 bg-[#0f1623] text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        props.className
      )}
    />
  );
}

export function AdminDialogHeader(props: React.ComponentPropsWithoutRef<typeof DialogHeader>) {
  return <DialogHeader {...props} className={cn("text-white", props.className)} />;
}

export function AdminDialogTitle(props: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  return <DialogTitle {...props} className={cn("text-white", props.className)} />;
}

export function AdminDialogDescription(
  props: React.ComponentPropsWithoutRef<typeof DialogDescription>
) {
  return <DialogDescription {...props} className={cn("text-white/70", props.className)} />;
}

export function AdminDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("border-white/10", props.className)} />;
}

export {
  AlertDialog as AdminAlertDialog,
  AlertDialogTrigger as AdminAlertDialogTrigger,
  AlertDialogAction as AdminAlertDialogAction,
  AlertDialogCancel as AdminAlertDialogCancel,
  AlertDialogContent as AdminAlertDialogContent,
  AlertDialogTitle as AdminAlertDialogTitle,
  AlertDialogDescription as AdminAlertDialogDescription,
};
