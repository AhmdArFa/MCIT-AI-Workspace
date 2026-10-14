import { open } from 'node:fs/promises';

import type { BinarySniffResult } from '@tut/utils/isBinaryContent';
import { sniffBinaryBuffer } from '@tut/utils/isBinaryContent';

export { type BinarySniffResult, sniffBinaryBuffer } from '@tut/utils/isBinaryContent';

const SNIFF_BYTES = 8192;

/**
 * Read up to the leading 8KB of a file and run the binary heuristic on it.
 */
export const sniffBinaryFile = async (filePath: string): Promise<BinarySniffResult> => {
  const fd = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(SNIFF_BYTES);
    const { bytesRead } = await fd.read(buffer, 0, SNIFF_BYTES, 0);
    return sniffBinaryBuffer(buffer.subarray(0, bytesRead));
  } finally {
    await fd.close();
  }
};
