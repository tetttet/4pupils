import UserListTable from "@/components/dashboard/admin/user/user-list-table";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import React from "react";

const page = () => {
  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Пользователи", href: "/dashboard/admin/users/teachers" },
          { label: `Аккаунты преподавателей` },
        ]}
      />
      <UserListTable userType="teacher" />
    </>
  );
};

export default page;
