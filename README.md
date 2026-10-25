# NBRET

**Network Based Reverse Engineering Tool**

事業パートナー向けの概要は [共同検証の紹介資料](docs/partner-brief.ja.md) をご覧ください。現在は技術プロトタイプです。[共有前の確認結果](docs/share-readiness-20261014.md) に実測結果と残る条件をまとめています。

Webサイトの「入力 → 通信 → 応答 → 表示」と、実行されたJavaScriptの証拠をまとめるローカルツールです。既存 `/copy` の画面・CSS抽出に、送受信の対応付けと公式REA CLIの観察を統合しました。LLM APIは呼びません。証拠を使った分析・再実装をAIに依頼する場合は、そのAIの利用料が別に発生します。

## 最初に動かす

Node.js 22.19以降の22系、24.11以降の24系、または26以降。Chromeがあればheadlessで使用できます。Chromiumを別途導入する場合は `npx playwright install chromium` を実行してください。

```sh
npm ci
npm test
npm run demo
```

デモは自分のPC内だけでHTTPサイトを起動します。ボタン操作から `20+5 → 25` と `7+3 → 10` を取得し、送信値・応答値を照合します。通信を起こしたJSとREAが読んだJSのSHA-256一致、PC/スマホのCOPY抽出まで確認します。単なる200 OK判定ではありません。

## 自分の対象サイトを観測

```sh
npm run capture -- --url https://your-authorized-site.example/ --out runs/example --actions actions.json --include-script-sources
```

`actions.json` の例:

```json
[
  {"type":"fill","selector":"#a","value":"20"},
  {"type":"fill","selector":"#b","value":"5"},
  {"type":"click","selector":"#calculate"},
  {"type":"wait","ms":500}
]
```

対応操作は `fill` / `click` / `hover` / `scroll`（`y`）/ `wait`（`ms`、最大10秒）。明示した操作は実際に実行します。送信・購入・削除などのボタンを不用意に指定せず、自分が許可された対象と操作に限定してください。

出力先は新規ディレクトリのみ。既存runを上書きしません。毎回新しいheadlessブラウザを使い、個人プロフィールや他セッションのタブには接続しません。`NBRET_BROWSER_CHANNEL=chrome` でChromeを指定できます。

`--no-rea` / `--no-copy` で各工程を省略できます。`--include-script-sources` は**生のJavaScript保存への明示指定**です。指定しない場合でも通信の構造化本文とスクリプトの指紋は記録します。

## 出力を読む

| ファイル | 内容 |
| --- | --- |
| `summary.json`, `REPORT.md` | 各工程の成功/失敗、件数、制限 |
| `network/evidence.json` | 操作ID、通信ID、送信値、応答、initiator、キャッシュ属性、DOM寸法、storage件数 |
| `network/assets/` | マスクしたJSON/form本文、明示指定時のJSソース |
| `rea.json` | REA 6.4.0が同じページで取得した公式の証拠。completeとは限らず、completenessを確認 |
| `links.json` | 通信のinitiatorから自前・REA双方のスクリプト証拠へのリンク、取得できた場合のSHA-256比較 |
| `copy/` | 1440×900 / 390×844のDOM、使用CSS、素材URL一覧、スクリーンショット |

**同じ操作IDであることは、因果関係の証明ではありません。** タイマーなど並行処理もあるため、initiator、時刻、入力変更による結果の変化を合わせて判断します。

## COPYの再構築・比較ツール

既存ツールも `copy/` と `mirror/` に収録しています。実行はこのリポジトリのルートから行います。

```sh
npm run copy:scaffold -- --out runs/rebuild --url https://your-authorized-site.example/ --from runs/example/copy
node copy/assets.mjs --list runs/example/copy/assets.txt --out runs/rebuild/assets --referer https://your-authorized-site.example/
node runs/rebuild/assemble.mjs
```

scaffoldは再構築の出発点です。元の動作を自動で完全実装するものではありません。取得したJSと通信を読んで `parts/app.js` 等を実装し、素材参照をローカルへ変更します。その後に `copy/geo.mjs`, `copy/states.mjs`, `copy/motion.mjs`, `copy/opening.mjs` で比較できます。`mirror/mirror.mjs` はサイト巡回と素材保存、`mirror/serve.mjs` はローカル再生の既存ツールです。全サイト巡回や再構築は標準captureでは自動実行しません。

## 記録範囲と取り扱い

- 通信本文の既定対象は開始URLと同じoriginです。別originのAPI/CDN本文は対象外として記録します。
- 構造化されたJSON/formのpassword/token/cookie等のキーをマスクします。万能な秘密検出ではありません。
- COPYのHTML・画像、REA出力、raw JS、`browser-profile/` にはサイト由来の秘密・個人情報が含まれ得ます。`runs/` はGit除外し、必要なローカル証拠として扱ってください。
- REAは**操作後**の同じページを別の時間窓で観察します。既に終わった通信をREAが再取得したとは扱いません。そこはNBRETの事前接続した記録が担当します。
- COPYは別のfresh contextで取得するため、操作後の状態・ログイン状態を引き継ぎません。
- HTTPキャッシュはCDPの利用フラグ、local/session storageとCache Storageは件数です。**メモリ全体・キャッシュ内容の完全ダンプではありません。**
- サーバー内部、worker/OOPIFの完全追跡、WebSocket本文、バイナリプロトコル、元ソースの完全復元は対象外です。

詳しくは [既存機能の確認結果](docs/existing-network.md)、[構成](docs/architecture.md)、[検証記録](docs/verification.md) を参照してください。
