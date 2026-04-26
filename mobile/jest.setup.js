/* global jest */

// Mock global registry untuk mencegah ReferenceError: You are trying to `import` a file outside of the scope
global.__ExpoImportMetaRegistry = {};

// Mock expo-router jika digunakan dalam proyek
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  Link: 'Link',
}));