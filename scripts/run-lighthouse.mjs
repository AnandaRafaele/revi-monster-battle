import { spawn, execFileSync } from 'node:child_process'
import { mkdir, access, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import lighthouse, { desktopConfig } from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'lighthouse-reports')
const host = '127.0.0.1'
const port = 4173
const baseUrl = `http://${host}:${port}`

const routes = [
  { id: 'home', path: '/' },
  { id: 'battle', path: '/battle' },
]

function run(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: opts.stdio ?? 'inherit',
      shell: true,
      ...opts,
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status === 404) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`Preview server did not become ready at ${url}`)
}

function scorePct(category) {
  if (!category || category.score == null) return '—'
  return String(Math.round(category.score * 100))
}

function metric(audits, id) {
  return audits[id]?.displayValue ?? '—'
}

function killProcessTree(child) {
  if (!child?.pid || child.exitCode != null) return

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      })
    } catch {
      // process may already be gone
    }
    return
  }

  child.kill('SIGTERM')
}

async function main() {
  if (!(await fileExists(path.join(root, 'dist', 'index.html')))) {
    console.log('No dist/ found — running production build…')
    await run('npm', ['run', 'build'])
  }

  await mkdir(outDir, { recursive: true })

  console.log(`Starting preview on ${baseUrl} …`)
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--host', host, '--port', String(port), '--strictPort'],
    { cwd: root, shell: true, stdio: ['ignore', 'pipe', 'pipe'] },
  )

  let previewLog = ''
  preview.stdout?.on('data', (chunk) => {
    previewLog += chunk.toString()
  })
  preview.stderr?.on('data', (chunk) => {
    previewLog += chunk.toString()
  })

  const shutdown = async () => {
    killProcessTree(preview)
    // Give Windows a moment to release the port
    await new Promise((r) => setTimeout(r, 300))
  }

  process.on('SIGINT', () => {
    void shutdown().finally(() => process.exit(130))
  })
  process.on('SIGTERM', () => {
    void shutdown().finally(() => process.exit(143))
  })

  try {
    await waitForServer(baseUrl)
    console.log('Preview ready. Launching Chrome + Lighthouse (desktop)…\n')

    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
    })

    try {
      for (const route of routes) {
        const url = `${baseUrl}${route.path}`
        console.log(`→ ${route.id}: ${url}`)

        const result = await lighthouse(
          url,
          {
            port: chrome.port,
            output: ['json', 'html'],
            logLevel: 'error',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          },
          desktopConfig,
        )

        if (!result) throw new Error(`Lighthouse returned no result for ${url}`)

        const jsonPath = path.join(outDir, `${route.id}.report.json`)
        const htmlPath = path.join(outDir, `${route.id}.report.html`)
        const report = result.report
        const jsonReport = Array.isArray(report) ? report[0] : report
        const htmlReport = Array.isArray(report) ? report[1] : null

        await writeFile(
          jsonPath,
          typeof jsonReport === 'string' ? jsonReport : JSON.stringify(result.lhr, null, 2),
        )
        if (htmlReport) {
          await writeFile(htmlPath, htmlReport)
        }

        const cats = result.lhr.categories
        const audits = result.lhr.audits
        console.log(
          `  Perf ${scorePct(cats.performance)} · A11y ${scorePct(cats.accessibility)} · BP ${scorePct(cats['best-practices'])} · SEO ${scorePct(cats.seo)}`,
        )
        console.log(
          `  FCP ${metric(audits, 'first-contentful-paint')} · LCP ${metric(audits, 'largest-contentful-paint')} · TBT ${metric(audits, 'total-blocking-time')} · CLS ${metric(audits, 'cumulative-layout-shift')}`,
        )
        console.log(
          `  Saved ${path.relative(root, jsonPath)}` +
            (htmlReport ? ` + ${path.relative(root, htmlPath)}` : ''),
        )
        console.log('')
      }
    } finally {
      await chrome.kill()
    }

    console.log(`Done. Open HTML reports in ${path.relative(root, outDir)}/`)
  } catch (err) {
    console.error(err)
    if (previewLog.trim()) {
      console.error('\n--- preview log ---\n' + previewLog.trim())
    }
    await shutdown()
    process.exitCode = 1
    return
  }

  await shutdown()
}

await main()
