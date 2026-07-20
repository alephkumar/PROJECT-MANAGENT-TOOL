import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

describe('Badge components', () => {
  test('PriorityBadge renders the priority label', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('StatusBadge renders the status label', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  test('renders title and optional message', () => {
    render(<EmptyState title="No projects found" message="Create one to get started." />);
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  test('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('calls onConfirm and onCancel handlers when buttons are clicked', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete project?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Delete project?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
