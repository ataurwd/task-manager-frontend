'use client';

import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { AdminUsersTab } from '../../components/AdminUsersTab';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { currentUser } = useAuth();

  return (
    <DashboardLayout>
      {currentUser && <AdminUsersTab currentUser={currentUser} />}
    </DashboardLayout>
  );
}
