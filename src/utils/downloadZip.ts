import JSZip from 'jszip';

interface ZipFile { name: string; content: string | Blob; }

function readme(subdomain: string): string {
  return `# ${subdomain} — AlphaTekx Deployment

To run locally:
1. Open index.html in your browser
2. No server required for static sites

Deployed at: https://${subdomain}.alphatekx.name.ng
`;
}

const ENV_EXAMPLE = `# Add your environment variables here
# Example:
# API_KEY=your_key_here
`;

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My AlphaTekx Project</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0;
           background: #050d1a; color: #e6edf3; text-align: center; }
    h1   { font-size: 2rem; margin-bottom: 0.5rem; }
    p    { color: #8b949e; }
  </style>
</head>
<body>
  <div>
    <h1>Project Deployed ✓</h1>
    <p>Secured and deployed via AlphaTekx.</p>
  </div>
</body>
</html>
`;

export async function downloadProductionZip(
  subdomain: string,
  extraFiles?: ZipFile[],
): Promise<void> {
  const zip = new JSZip();

  // Project files
  if (extraFiles && extraFiles.length > 0) {
    for (const f of extraFiles) {
      zip.file(f.name, f.content);
    }
  } else {
    zip.file('index.html', PLACEHOLDER_HTML);
  }

  // Metadata
  zip.file('README.md', readme(subdomain));
  zip.file('.env.example', ENV_EXAMPLE);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${subdomain}-production.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
