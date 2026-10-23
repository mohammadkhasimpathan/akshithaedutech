'use client';

import * as React from 'react';
import { Job } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ApplyModal } from '@/components/public/apply-modal';
import { ReportModal } from '@/components/public/report-modal';
import { Share2, AlertTriangle, Send, Check } from 'lucide-react';

interface JobDetailActionsProps {
  job: Job;
}

export function JobDetailActions({ job }: JobDetailActionsProps) {
  const [isApplyOpen, setIsApplyOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={() => setIsApplyOpen(true)}
          className="gap-2 px-8 shadow-md shadow-blue-500/20"
        >
          <Send className="w-4 h-4" />
          Apply for this Position
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copied!' : 'Share Job'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReportOpen(true)}
          className="gap-1.5 text-xs text-slate-400 hover:text-rose-600 ml-auto"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Flag or Report Listing
        </Button>
      </div>

      <ApplyModal
        job={job}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />

      <ReportModal
        job={job}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
}
