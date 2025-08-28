declare module 'copy-to-clipboard' {
  interface CopyOptions {
    debug?: boolean;
    message?: string;
    format?: string;
    onCopy?: (clipboardData: any) => void;
  }
  export default function copy(text: string, options?: CopyOptions): boolean;
} 