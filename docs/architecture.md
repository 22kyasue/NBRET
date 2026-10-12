# 構成

1. `src/run.mjs` が新規出力とfresh headless profileを用意する。
2. `src/capture.mjs` がnavigation前にCDPのNetwork/Debuggerへ接続する。
3. 指定した操作を順に実行し、操作ラベル・送信/受信・DOM寸法を記録する。
4. `src/rea.mjs` が同じpage targetを公式REA CLIへ渡す。ソース照合用の別観察であり、過去通信の再取得ではない。
5. COPY extractを別ブラウザcontextで実行し、デスクトップ/モバイルの基準資料を作る。
6. `links.json` がinitiator URLとスクリプト証拠を結ぶ。両者にソースhashがある場合は一致を計算する。

REAはnpmの `rea-agents@6.4.0` を固定使用します。MCPのグローバル設定は変更しません。REA自体はMITライセンスの独立依存です。参照： https://rea.tools/guides/browser/ 、 https://github.com/morluto/rea 。

COPYの出典と原本hashは `source-manifest.json`。`copy/_lib.mjs` の起動は、利用可能なChromium/Chromeを選び、Windows以外へD3D11引数を渡さないよう独立用に変更しました。元skillが参照する外部BetterPlaywrightや全observe基盤まで含む完全移植ではありません。収録した抽出・再構築の土台・比較ツールが対象です。

入力20と5、出力25の観察だけでは足し算の証明にはなりません。デモでは入力を7と3に変えて出力10も照合し、さらにクライアントJSの通信呼び出し位置を記録します。それでもサーバー実装の一意復元や、全入力での同値性を証明するものではありません。
