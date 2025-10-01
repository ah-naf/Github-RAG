export function getLanguageFromFile(filename: string): string {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const name = filename?.toLowerCase();

  const langMap: { [key: string]: string } = {
    ts: 'typescript',
    js: 'javascript',
    jsx: 'jsx',
    tsx: 'tsx',
    html: 'markup',
    xml: 'markup',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    dockerfile: 'docker',   // Dockerfile
    docker: 'docker',

    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin'
  };

  // handle filenames without extension
  if (name?.startsWith('dockerfile')) return 'docker';

  return langMap[ext || ''] || 'plaintext';
}
