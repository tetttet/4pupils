"use client";
import UserListTable from "@/components/dashboard/admin/user/user-list-table";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import React from "react";

const page = () => {
  return (
    <div className="bg-linear-to-b from-neutral-50 to-white">
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Пользователи", href: "/dashboard/admin/users/students" },
          { label: `Аккаунты студентов` },
        ]}
      />
      <UserListTable userType="student" />
    </div>
  );
};

export default page;
