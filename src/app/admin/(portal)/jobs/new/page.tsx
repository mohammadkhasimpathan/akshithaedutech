import * as React from 'react';
import { Metadata } from 'next';
import { JobForm } from '../job-form';

export const metadata: Metadata = {
  title: 'Post New Job | Admin Portal',
};

export default function NewJobPage() {
  return <JobForm />;
}
