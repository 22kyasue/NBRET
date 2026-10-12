# 既存 /copy のNETWORKロジック確認

結論：一部は既にあります。しかし、ユーザーが説明した「入力・通信・出力・実行コードを対応付ける」工程全体にはなっていませんでした。

| 既存コード | 確認できた実装 |
| --- | --- |
| `mirror/mirror.mjs` | ページ巡回、ブラウザのresponse body保存、素材補完。URLとmanifestで管理 |
| `copy/extract.mjs` | networkにURL/type/status/mime/bytes、DOM・CSS・スクリプトURL・画面を保存 |
| `mirror/record-posts.mjs` | 指定ホストへのPOST本文と応答を保存し、パス＋本文hashで再生用に索引。Nuxt 2のrouter操作に特化 |

NBRETの実行で、既存extractのDOM/CSS/画面/network出力を実Chromeで確認しました。既存POST再生ツールを任意サイトで動く汎用観察基盤として検証したわけではありません。

不足していた共通の通信ID、操作時点、initiator、キャッシュ状態、保存上限、REAスクリプト照合を `src/capture.mjs` と `src/run.mjs` に追加しました。元ワークスペースのコードは変更していません。

以前別repoへ切り出した営業候補スクレイパーは本件と無関係です。NBRETにそのコードや営業データは含みません。
