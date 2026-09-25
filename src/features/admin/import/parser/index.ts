import { createStubParser } from './importParser.stub';

export { createStubParser };

// Swap point: replace with the real worker parser in import-worker.
export const createImportParser = createStubParser;
