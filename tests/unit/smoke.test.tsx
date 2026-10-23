import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINR, formatDate, cn } from '@/lib/utils';

describe('Phase 1 Foundation Unit Tests', () => {
  it('should format currency in INR properly', () => {
    const formatted = formatCurrencyINR(600000);
    expect(formatted).toMatch(/₹\s?6,00,000/);
  });

  it('should format dates predictably', () => {
    const formatted = formatDate('2026-10-23T12:00:00Z');
    expect(formatted).toContain('2026');
  });

  it('should combine class names using cn helper', () => {
    const classes = cn('px-4', true && 'py-2', false && 'hidden', 'text-white');
    expect(classes).toBe('px-4 py-2 text-white');
  });

  it('should render Button component with proper text and variant styles', () => {
    render(<Button variant="primary">Apply Now</Button>);
    const button = screen.getByRole('button', { name: /apply now/i });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-blue-600');
  });

  it('should render Badge component with proper variant', () => {
    render(<Badge variant="success">Fresher</Badge>);
    const badge = screen.getByText('Fresher');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('bg-emerald-100');
  });
});
