import type { IntakeAdapter, RawImportFile } from '../import.types';
import { classifyKind } from './index';

function entryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

// readEntries returns at most 100 entries per call; loop until batch is empty.
function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];

    function readBatch() {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          resolve(all);
        } else {
          all.push(...entries);
          readBatch();
        }
      }, reject);
    }

    readBatch();
  });
}

// BFS over the directory tree to avoid call-stack overflow on large trees.
async function collectFileEntries(root: FileSystemEntry): Promise<FileSystemFileEntry[]> {
  const results: FileSystemFileEntry[] = [];
  const queue: FileSystemEntry[] = [root];

  while (queue.length > 0) {
    const entry = queue.shift()!;
    if (entry.isFile) {
      results.push(entry as FileSystemFileEntry);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const children = await readAllEntries(reader);
      queue.push(...children);
    }
  }

  return results;
}

export class FolderAdapter implements IntakeAdapter {
  readonly id = 'folder' as const;

  async collect(source: DataTransfer | FileList): Promise<RawImportFile[]> {
    if (source instanceof DataTransfer) {
      return this._collectFromDataTransfer(source);
    }
    return this._collectFromFileList(source);
  }

  private async _collectFromDataTransfer(dt: DataTransfer): Promise<RawImportFile[]> {
    const filePromises: Promise<RawImportFile>[] = [];

    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      const entry = item.webkitGetAsEntry();
      if (!entry) continue;

      const fileEntries = await collectFileEntries(entry);

      for (const fileEntry of fileEntries) {
        filePromises.push(
          entryToFile(fileEntry).then((file) => {
            // fullPath starts with "/" — strip it
            const relativePath = fileEntry.fullPath.replace(/^\//, '');
            return {
              relativePath,
              fileName: fileEntry.name,
              kind: classifyKind(fileEntry.name),
              file,
            } satisfies RawImportFile;
          }),
        );
      }
    }

    return Promise.all(filePromises);
  }

  private _collectFromFileList(fileList: FileList): Promise<RawImportFile[]> {
    const results: RawImportFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      results.push({
        relativePath: f.webkitRelativePath || f.name,
        fileName: f.name,
        kind: classifyKind(f.name),
        file: f,
      });
    }
    return Promise.resolve(results);
  }
}
