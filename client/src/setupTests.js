// src/setupTests.js
// This file sets up the Jest testing environment for React components

import "@testing-library/jest-dom";

// Mock matchMedia for tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// TextEncoder/TextDecoder polyfill (needed for React Router v7)
if (
  typeof global.TextEncoder === "undefined" ||
  typeof global.TextDecoder === "undefined"
) {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Silence React 18 ReactDOM.render warnings
jest.mock("react-dom", () => {
  const originalModule = jest.requireActual("react-dom");
  return {
    ...originalModule,
    render: jest.fn(),
  };
});

// Mock fetch API
global.fetch = jest.fn().mockImplementation((url) => {
  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        data: [],
        message: "Success",
      }),
  });
});
