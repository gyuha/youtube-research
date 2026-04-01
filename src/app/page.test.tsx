import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the dashboard heading', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /youtube research dashboard/i }),
    ).toBeInTheDocument();
  });
});
