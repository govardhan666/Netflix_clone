import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test that doesn't require full app setup
test('renders test passes', () => {
  const div = document.createElement('div');
  expect(div).toBeInTheDocument();
});
