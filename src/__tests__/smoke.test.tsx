import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

test('renders a React component', () => {
  render(<Greeting name="TabSpot" />);
  expect(screen.getByRole('heading', { level: 1, name: 'Hello, TabSpot' })).toBeDefined();
});
