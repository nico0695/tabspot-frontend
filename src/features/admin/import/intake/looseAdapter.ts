import type { IntakeAdapter, RawImportFile } from '../import.types';
import { classifyKind } from './index';

export class LooseAdapter implements IntakeAdapter {
  readonly id = 'loose' as const;

  collect(source: DataTransfer | FileList): Promise<RawImportFile[]> {
    // Use duck-typing instead of instanceof so the branch works in test
    // environments (happy-dom) where DataTransfer may not be a real class.
    const fileList: FileList =
      'files' in source ? (source as DataTransfer).files : (source as FileList);
    const results: RawImportFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      results.push({
        relativePath: f.name,
        fileName: f.name,
        kind: classifyKind(f.name),
        file: f,
      });
    }

    return Promise.resolve(results);
  }
}
