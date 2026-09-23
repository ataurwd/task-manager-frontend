'use client';

import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { NotesTab } from '../components/NotesTab';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <DashboardLayout>
      {currentUser && <NotesTab currentUser={currentUser} />}
    </DashboardLayout>
  );
}
