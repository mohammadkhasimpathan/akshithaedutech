import * as React from 'react';
import { connection } from 'next/server';
import {
  getStudentRegistrationsAdmin,
  getEmployerRegistrationsAdmin,
  getCollegeRegistrationsAdmin,
} from '@/app/actions/registration-actions';
import { RegistrationsClient } from './registrations-client';

export const metadata = {
  title: 'Registrations Management | Admin Portal',
};

async function RegistrationsDataWrapper() {
  await connection();
  const [students, employers, colleges] = await Promise.all([
    getStudentRegistrationsAdmin(),
    getEmployerRegistrationsAdmin(),
    getCollegeRegistrationsAdmin(),
  ]);

  return (
    <RegistrationsClient
      initialStudents={students}
      initialEmployers={employers}
      initialColleges={colleges}
    />
  );
}

function RegistrationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-72 mb-4" />
      <div className="flex gap-2">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <React.Suspense fallback={<RegistrationsSkeleton />}>
      <RegistrationsDataWrapper />
    </React.Suspense>
  );
}
