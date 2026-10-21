# NBRETの有効性・優位性の検証

対象：NBRET `0fcdfa6`、REA `6.4.0`。2026-10-12。製品コードは変更せず、ローカルの制御可能なHTTPサイトで観測実験を行った。

## 結論

**FYI:** 入出力に加えて通信・呼び出し元を観測すると、画面だけでは得られない情報が増える。これは実測できた。ただし、現在のNBRETがREAより高精度・低コストで元コードを復元できるという優位性は未実証。現在は証拠収集・整理の試作として評価するのが正確。

**Important:** 前の説明を訂正する。REA 6.4には通信本文の選択取得、操作シナリオ、capture比較、スクリーンショット比較がある。「REAは解析だけ、比較工程がない」という区別は正確ではなかった。NBRETはREAのpassive inspectしか統合しておらず、既存機能を十分活用していない。

## 方法

実験コード：`experiments/effectiveness.mjs`。生証跡：`runs/evaluation-1791813315618/`。共有可能な集計：`results-20261012.json`。

同じ実Chromeで次を実行した：JSON API、入力変更、別サーバー実装、クライアント内計算、localStorage、HTTPキャッシュ初回/再利用、別origin API、非JSON本文、アプリ内エンコード、遅延通信。追加でREAも通信中に2秒観測した。

これは証拠の取得能力と識別限界の実験であり、AIに再実装させる盲検試験ではない。実サイトの復元成功率・モデルの推論精度・トークン削減率は測っていない。

## 実測結果

| ケース | 観測結果 | 効果・限界 |
| --- | --- | --- |
| POST 20/5 → 25 | 入力JSON・応答JSON・呼び出し元JS位置を取得 | 25しか見ない場合より、関数の入出力契約が明確 |
| 入力を7/3へ変更 → 10 | 入出力の変化を取得 | 固定25という仮説を排除できる。任意入力で足し算だとの証明にはならない |
| サーバーを足し算から表引きへ変更 | 同じURL・送信本文・応答本文になった | 通信が同じでも元の内部実装は一意に分からない |
| JS内の20+5 | 出力25、新しい通信0 | ネットワーク追加の利益なし。JSソース観察が必要 |
| localStorageから25 | 出力25、新しい通信0 | 現実装はstorage件数だけ。値・依存関係は分からない |
| HTTPキャッシュ初回/再利用 | JSON本文と再利用フラグを取得 | 「通信が省かれた」という動作理由の手掛かりになる。全キャッシュ内容の復元ではない |
| 別origin APIから25 | requestはあるが本文`out-of-scope` | 通常のAPI分離構成で重要な情報が欠落する |
| `answer=25`のtext/plain | 本文`non-structured-payload` | 現実装の形式制限。HTTPとして取れないわけではない |
| JSON内のBase64 packet | `packet`の送受信は保存、20/5は直接出ない | ソースのbtoa/atob等を合わせて解釈する必要。Base64は暗号化ではない |
| Aが遅延通信を予約、その後B | A由来のrequestにBのactionIdが付いた | 操作区間と原因は別。時間だけでは因果関係を誤る |

**Important:** 遅延通信では、予約した操作IDは11、観測された通信のIDは12となった。入出力のrequestId対応は正しいが、操作の原因は誤って読める。`actionId`を「原因」としてAIへ渡すのは危険。現在のコードは制限を明記しているものの、名称・出力構造の改善余地がある。

**Important:** `runCapture` はoriginを開始URLに固定するため、API用サブドメイン/CDNなどが取得対象から落ちる。内部collectorは複数originを受け取れるが、CLIにその指定がない。まず明示allowlistと欠落レポートを追加するのが有効。

**Important:** REAは操作終了後に観測し、COPYは別のfresh contextでページを読み直す。同じ入力済み画面を同時に観測する構成ではない。現在の「統合」は証拠ファイルとスクリプトhashの照合であり、同一状態の網羅的な再構成ではない。

## REAとの比較

REAの `inspect-web-page` を通信中に実行し、19件のPOST、initiator、入力a/bと出力resultのJSON構造を取得した。後から接続したため通信がない、という条件差をREAの機能不足として扱わない。

さらに `experiments/rea-scenario.mjs` で公式 `capture-browser-scenario` を実行。クリック操作から送信本文 `{a:20,b:5}` と応答本文 `{result:25}` が**REA単体でも取得でき、同じtransaction_idで対応付く**ことを実際にdecodeしてassertした。集計は `rea-scenario-20261012.json`。本文取得の重複は仕様だけでなく実動作で確認済み。

REAのこのrunは全体のcompletenessが`incomplete`（missing_sections: events）で、equality_eligible=falseだった。上記の本文ペアの取得確認と、シナリオ全体を完全に取得できたことは区別する。REAの全機能の完成度を保証する実験ではない。

インストール済み公式パッケージでも、以下を確認した。

- `dist/contracts/browserScenarioToolContracts.js`：`capture_browser_scenario`はrequest_body/response_body/header_valuesを選択し、transaction/event参照・hash・欠落状態を返す。
- `dist/browser/network/PlaywrightScenarioNetwork.js`：送信本文・応答本文の実取得。
- `dist/cli/browserAdvancedCommands.js`：capture比較と画像比較。
- `dist/domain/browserScenarioValues.js`：各ステップのDOM/画像/storage取得。

**FYI:** NBRETの現時点の差は、既存COPYの画面幅別DOM/CSS抽出を取り込み、送受信・ソース照合・再構築資料を一つの作業フォルダにまとめていること。ネットワーク観測自体を独自技術・競争優位とは言えない。REA側にも同様の時間的step帰属があり、REAなら因果関係を完全に解けるという意味でもない。

公式資料： [REA Browser Guide](https://rea.tools/guides/browser/)、[REA source](https://github.com/morluto/rea)、[Chrome DevTools Network protocol](https://chromedevtools.github.io/devtools-protocol/tot/Network/)。REAサイトの例と最新版packageでは機能範囲に差があるため、本評価では実際に使っている6.4.0も照合した。

## 記録の負荷

同じローカルページから20回の逐次JSON requestを実行。ウォームアップ後、記録あり/なしの順序を交互にして各5回。

- 記録なしの操作時間中央値：16.87 ms。
- 記録あり：21.68 ms。差は約4.81 ms（約28.5%）。
- 記録終了時の永続化中央値：2.17 ms。

**FYI:** この数値は非常に小さいローカルfixtureの測定。ネットワーク待ち・巨大アセット・GPU演出を持つ実サイトに一般化できない。collector接続・ブラウザ起動・REA/COPY工程はこの時間に含めていない。高速化の優位性を示すものではなく、観測にも負荷があることの確認。

## どこで価値があるか

- API駆動の画面、検索・絞り込み・ページ送り：パラメーター、応答構造、描画に使うフィールドを把握しやすい。
- 不具合調査：画面処理かAPI応答か、キャッシュか、送信値の違いかを切り分けやすい。
- フロントエンド再実装：実応答からfixtureを作れば、画面だけの推測より実データ構造へ近づける。
- UIだけの演出、ローカル計算、サーバー内部の秘密処理：通信を増やして見ても効果が小さい、または内部構造は特定できない。

通信は「PCのメモリに入ったすべて」ではない。受信後に生成したオブジェクト・中間値・ローカルDB・WASMの内部状態は別途観測が必要。HTTPS通信のブラウザ内観測は、端末が処理する平文をCDPで見るもので、TLS暗号を破っているわけではない。

## 優位性を実証するための次の比較

優先順位は以下。今回は監査なので製品コードは変えていない。

1. **Important:** 同じpage/状態で通信とCOPY抽出を取得し、origin allowlist・期待応答待機・不足表示を整える。
2. **Important:** actionを観測区間として明示し、入力変更・反復・未見入力で仮説を検証する。原因を決め打ちしない。
3. **FYI:** REAのscenario captureを使い、既存機能を活用する。必要なstorage項目や形式だけを明示的に取得する。
4. **FYI:** 同じ対象、同じAIモデル、同じ予算で「画面/COPYのみ」「適切な設定のREA」「NBRET」を比較する。評価は未見入力での再実装正解率、重要な分岐の網羅、誤帰属率、作業時間、AIトークン量。

証拠が増えて推論しやすくなることと、トークンが減ることは別。大量の記録をそのまま渡すと、むしろAI消費は増え得る。必要な通信・ソース区間を選んで提示する仕組みまで含めて測る必要がある。
