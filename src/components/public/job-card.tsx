import Link from 'next/link';
import { MapPin, Briefcase, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { Job } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrencyINR, formatDate } from '@/lib/utils';

export interface JobCardProps {
  job: Job;
  onApplyClick?: (job: Job) => void;
}

export function JobCard({ job, onApplyClick }: JobCardProps) {
  const isFresher = job.experience_min === 0 && job.experience_max <= 1;

  // Format salary range if available
  const hasSalary = job.salary_min !== null || job.salary_max !== null;
  let salaryText = '';
  if (hasSalary) {
    if (job.salary_min && job.salary_max) {
      salaryText = `${formatCurrencyINR(job.salary_min)} – ${formatCurrencyINR(job.salary_max)} / year`;
    } else if (job.salary_min) {
      salaryText = `From ${formatCurrencyINR(job.salary_min)} / year`;
    } else if (job.salary_max) {
      salaryText = `Up to ${formatCurrencyINR(job.salary_max)} / year`;
    }
  }

  // Work mode badge styling
  const workModeVariant =
    job.work_mode === 'remote' ? 'info' : job.work_mode === 'hybrid' ? 'warning' : 'secondary';

  return (
    <Card className="flex flex-col justify-between hover:border-blue-400/80 hover:shadow-lg transition-all duration-200 group">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {job.featured && (
                  <Badge variant="default" className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </Badge>
                )}
                {isFresher ? (
                  <Badge variant="success">Freshers Welcome (0-1 yr)</Badge>
                ) : (
                  <Badge variant="default">
                    {job.experience_min}–{job.experience_max} yrs exp
                  </Badge>
                )}
                <Badge variant={workModeVariant} className="capitalize">
                  {job.work_mode}
                </Badge>
              </div>

              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
              </CardTitle>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {job.company_name} • <span className="text-blue-600 dark:text-blue-400">{job.category}</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Location and Employment Type */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1 capitalize">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.employment_type}</span>
            </div>
            {hasSalary && (
              <div className="font-semibold text-slate-900 dark:text-white">
                💰 {salaryText}
              </div>
            )}
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          {/* Skills tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div>
          {job.application_deadline ? (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Deadline: {formatDate(job.application_deadline)}
            </span>
          ) : (
            <span>Actively Hiring</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onApplyClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyClick(job)}
              className="text-xs h-8 px-3"
            >
              Apply
            </Button>
          )}
          <Link href={`/jobs/${job.slug}`}>
            <Button size="sm" className="text-xs h-8 px-3 gap-1">
              Details
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
