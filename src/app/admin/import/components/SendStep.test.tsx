import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import type { SendError } from '@/features/admin/import/import.types';
import { SendStep } from './SendStep';

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@/features/admin/import/import.api', () => ({
  sendBulkImport: vi.fn(),
}));

const DEFAULT_ERROR_TEXT = 'Ocurrió un error durante el envío.';

function seedErrorState(error: SendError) {
  useImportWizardStore.setState({
    sendStatus: 'error',
    sendProgress: { batch: 1, totalBatches: 1, sent: 0, totalSongs: 1, errors: [error] },
  });
}

function makeSendError(message: string): SendError {
  return { batchIndex: 0, songIndex: 0, title: 'Song 0', code: 'UNKNOWN', message };
}

/** The alert paragraph is the only `<p>` inside the error state container. */
function alertText(): string | undefined {
  return screen.getByRole('alert').querySelector('p')?.textContent ?? undefined;
}

afterEach(() => {
  // Vitest runs without globals, so RTL does not auto-cleanup between tests.
  cleanup();
  useImportWizardStore.getState().reset();
});

describe('SendStep error alert', () => {
  test('falls back to the default message when the error message is empty', () => {
    seedErrorState(makeSendError(''));

    render(<SendStep />);

    expect(alertText()).toBe(DEFAULT_ERROR_TEXT);
  });

  test('renders the real error message when it is present', () => {
    seedErrorState(makeSendError('El lote superó el tamaño permitido.'));

    render(<SendStep />);

    expect(alertText()).toBe('El lote superó el tamaño permitido.');
  });
});
