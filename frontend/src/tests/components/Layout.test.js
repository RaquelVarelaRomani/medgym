import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../modules/app/components/Layout';

jest.mock('../../modules/app/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Mock Header</header>;
  };
});

describe('Layout Component', () => {
  test('renders the Header component', () => {
    render(<Layout><div>Test Content</div></Layout>);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
  });

  test('renders children inside the main element', () => {
    const testContent = 'Test Content';
    render(<Layout><div>{testContent}</div></Layout>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveTextContent(testContent);
  });

  test('has proper DOM structure with div container containing Header and main', () => {
    const { container } = render(<Layout><div>Test Content</div></Layout>);

    const rootDiv = container.firstChild;
    expect(rootDiv).toBeInTheDocument();
    expect(rootDiv.tagName).toBe('DIV');

    const children = Array.from(rootDiv.children);
    expect(children).toHaveLength(2);

    expect(children[0]).toHaveAttribute('data-testid', 'mock-header');

    expect(children[1].tagName).toBe('MAIN');
  });

  test('handles empty children gracefully', () => {
    render(<Layout></Layout>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toBeEmptyDOMElement();
  });

  test('handles null children gracefully', () => {
    render(<Layout>{null}</Layout>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toBeEmptyDOMElement();
  });

  test('handles undefined children gracefully', () => {
    render(<Layout>{undefined}</Layout>);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toBeEmptyDOMElement();
  });
});