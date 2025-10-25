import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

import App from "../../modules/app/components/App";

jest.mock("../../modules/app/components/Body", () => {
  return function MockBody() {
    return <div data-testid="mock-body">Mock Body</div>;
  };
});

describe("App Component", () => {
  test("renders the HashRouter (aliased as Router) component", () => {
    render(<App />);

    expect(screen.getByTestId("mock-body")).toBeInTheDocument();
  });

  test("renders the Body component inside the Router", () => {
    render(<App />);

    expect(screen.getByTestId("mock-body")).toBeInTheDocument();
    expect(screen.getByText("Mock Body")).toBeInTheDocument();
  });

  test("ensures no additional DOM elements are rendered outside the Router", () => {
    const { container } = render(<App />);

    const rootElement = container.firstChild;

    expect(rootElement).toHaveAttribute("data-testid", "mock-body");
    expect(rootElement.tagName).toBe("DIV");
  });

  test("proper component mounting without errors", () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();

    expect(screen.getByTestId("mock-body")).toBeInTheDocument();
  });
});
