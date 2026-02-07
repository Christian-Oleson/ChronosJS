import { vi } from 'vitest';

// Install fake timers BEFORE any library modules are imported.
// This ensures the module-level `const today = new Date()` in index.ts
// gets June 15, 2024 instead of the real date (which might trigger
// the 4-row February 2026 bug in scrapeMonth).
vi.useFakeTimers({ now: new Date(2024, 5, 15, 12, 0, 0) });
