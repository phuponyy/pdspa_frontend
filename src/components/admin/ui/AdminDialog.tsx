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
        "border border-white/10 bg-[#0b1220] text-white shadow-[0_24px_60px_rgba(2,6,23,0.65)]",
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

export { AlertDialog as AdminAlertDialog, AlertDialogTrigger as AdminAlertDialogTrigger };

export function AdminAlertDialogContent(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogContent>
) {
  return (
    <AlertDialogContent
      {...props}
      className={cn(
        "border border-white/10 bg-[#0b1220] text-white shadow-[0_24px_60px_rgba(2,6,23,0.65)]",
        props.className
      )}
    />
  );
}

export function AdminAlertDialogTitle(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogTitle>
) {
  return <AlertDialogTitle {...props} className={cn("text-white", props.className)} />;
}

export function AdminAlertDialogDescription(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogDescription>
) {
  return (
    <AlertDialogDescription {...props} className={cn("text-white/70", props.className)} />
  );
}

export function AdminAlertDialogAction(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogAction>
) {
  return (
    <AlertDialogAction
      {...props}
      className={cn(
        "border border-[#ff8a4b] bg-white text-black hover:bg-[#fff1e8]",
        props.className
      )}
    />
  );
}

export function AdminAlertDialogCancel(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogCancel>
) {
  return (
    <AlertDialogCancel
      {...props}
      className={cn("bg-[#0b1220] text-white hover:bg-white/5", props.className)}
    />
  );
}
