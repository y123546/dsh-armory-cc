#!/usr/bin/env node
// Re-apply the patches under patches/ to the working tree.
//
// Why this exists: this repository ships the built `lib/` rather than sources it
// from `src/`, so every upstream release rewrites the same files we patch. After
// syncing with upstream, run this to put the local fixes back.
//
//   node apply-patches.mjs            # apply every patches/*.patch
//   node apply-patches.mjs --check    # dry run, report whether they would apply
//   node apply-patches.mjs --sync     # fetch+merge upstream first, then apply
//
// `--sync` needs an `upstream` remote:
//   git remote add upstream https://github.com/2026heshao/dsh-armory.git
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--check')
const sync = args.has('--sync')

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, { stdio: 'inherit', ...options })
}

function runQuiet(command, commandArgs) {
  try {
    execFileSync(command, commandArgs, { stdio: 'pipe' })
    return { ok: true, output: '' }
  } catch (error) {
    return { ok: false, output: String(error.stderr || error.message) }
  }
}

const patchDir = 'patches'
const patches = readdirSync(patchDir)
  .filter((name) => name.endsWith('.patch'))
  .sort()

if (patches.length === 0) {
  console.log('没有找到补丁（patches/*.patch）')
  process.exit(0)
}

if (sync) {
  const hasUpstream = runQuiet('git', ['remote', 'get-url', 'upstream']).ok
  if (!hasUpstream) {
    console.error('缺少 upstream 远端，先执行：')
    console.error('  git remote add upstream https://github.com/2026heshao/dsh-armory.git')
    process.exit(1)
  }
  console.log('→ git fetch upstream')
  run('git', ['fetch', 'upstream'])
  console.log('→ git merge upstream/main --no-edit')
  const merged = runQuiet('git', ['merge', 'upstream/main', '--no-edit'])
  if (!merged.ok) {
    console.error('合并有冲突，需要手动解决后再运行本脚本（不带 --sync）：')
    console.error(merged.output)
    process.exit(1)
  }
}

let failed = 0
for (const name of patches) {
  const file = join(patchDir, name)
  // 已经应用过的补丁：反向检查能通过 → 跳过，避免重复应用报错。
  const applied = runQuiet('git', ['apply', '--reverse', '--check', file]).ok
  if (applied && !dryRun) {
    console.log(`已应用过，跳过: ${name}`)
    continue
  }
  const flags = ['apply', '--3way', '--ignore-whitespace', '--whitespace=nowarn', ...(dryRun ? ['--check'] : []), file]
  const result = runQuiet('git', flags)
  if (result.ok) {
    console.log(`${dryRun ? '可以应用' : '已应用'}: ${name}`)
  } else {
    failed += 1
    console.error(`失败: ${name}`)
    console.error(result.output.trim())
  }
}

if (failed > 0) {
  console.error('')
  console.error('提示：上游重建过 lib/*.js 时，旧上下文可能对不上。做法是')
  console.error('  1) git checkout upstream/main -- <冲突文件>')
  console.error('  2) 重新手工改一遍，然后 git diff > patches/NNNN-描述.patch')
  console.error('  3) 删掉失效的旧补丁，提交新的')
  process.exit(1)
}

console.log(dryRun ? '检查完成，全部可以应用。' : '全部补丁已应用。记得 git add + commit。')
