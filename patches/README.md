# patches/

本仓库发布的是构建产物 `lib/`，上游每次发版都会重建同名文件，所以本地改动
（见下面清单）在同步上游之后需要**重新应用**。补丁就放在这个目录里。

## 升级流程

```bash
git remote add upstream https://github.com/2026heshao/dsh-armory.git   # 只需一次

node apply-patches.mjs --sync    # 拉取并合并上游，然后重放全部补丁
node apply-patches.mjs --check   # 只检查补丁能否干净应用
node apply-patches.mjs           # 重放补丁（不合上游）
```

合并冲突时脚本会停下并打印 git 的输出，按提示手工解决后再运行不带 `--sync`
的那条。

补丁用 `git apply --3way` 应用，**改动会进入暂存区**（`git status` 显示 `M`），
确认无误后直接 `git commit` 即可。

## 补丁清单

| 文件 | 内容 | 原因 |
|---|---|---|
| `0001-menu-fixed-positioning.patch` | `.dsh-mcp-quick-menu` 的定位改为「探针量原点 + 尺寸/视口变化重算」 | DSH 0.2.2 给输入区容器加了 `contain`/`transform`，`position:fixed` 被重新锚定，原实现按视口算坐标会整体偏移（菜单跑到图标右边、首次打开偏高） |

## 补丁失配了怎么办

上游大改过 `lib/client.js` 时，上下文对不上是正常的：

```bash
git checkout upstream/main -- lib/client.js   # 先接受上游版本
# 手工把改动再改一遍（对照上面的原因，定位 .dsh-mcp-quick-menu 的 measureEffect）
git diff > patches/0002-描述.patch            # 生成新补丁
rm patches/0001-menu-fixed-positioning.patch  # 删掉失效的旧补丁
```

补丁文件用 `git diff` 生成、以 `git apply` 应用，路径前缀是 `a/` `b/`，不要手改。
