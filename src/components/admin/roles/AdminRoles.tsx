"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const roles = [
  { name: "Admin", permissions: ["view_dashboard", "manage_bookings", "manage_customers", "export_data", "manage_staff"] },
  { name: "Le tan", permissions: ["view_dashboard", "manage_bookings", "manage_customers"] },
  { name: "Quan ly chi nhanh", permissions: ["view_dashboard", "manage_bookings", "manage_customers", "export_data"] },
];

export default function AdminRoles() {
  return (
    <div className="space-y-8">
      <Card className="border-white/5">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <p className="text-sm text-white/60">Kiem soat truy cap theo vai tro.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create role</DialogTitle>
                <DialogDescription>
                  Mau cau hinh quyen theo vai tro. Ket noi API de luu thay doi.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl border border-white/10 bg-[#0f1722] p-4 text-sm text-white/70">
                role: custom_role
                <br />
                permissions: ["view_dashboard"]
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <div key={role.name} className="rounded-2xl border border-white/10 bg-[#111a25] p-4">
              <p className="text-sm font-semibold text-white">{role.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="default">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
