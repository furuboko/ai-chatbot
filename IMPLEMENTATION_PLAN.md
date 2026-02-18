# AI Chatbot Implementation Plan

**プロジェクト**: Claude AI チャットボット
**開始日**: 2026-02-16
**目標**: Next.js + Hono + MongoDB + Claude API によるエンタテインメント向けチャットアプリ

---

## 📋 実装フェーズ

### Phase 1: プロジェクトセットアップ ⚙️

#### 1.1 Next.js プロジェクト初期化
- [x] Next.js 14+ プロジェクトを作成（App Router使用）
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --no-src
  ```
- [x] 必要なパッケージをインストール
  - [x] `@hono/node-server` - Hono サーバー
  - [x] `hono` - API フレームワーク
  - [x] `@anthropic-ai/sdk` - Claude API クライアント
  - [x] `@prisma/client` - Prisma ORM
  - [x] `prisma` (dev) - Prisma CLI
  - [x] `zod` - バリデーション
- [x] `src/` ディレクトリ構造を作成
  ```
  src/
  ├── app/
  ├── components/
  ├── lib/
  └── types/
  ```

#### 1.2 shadcn/ui セットアップ
- [x] shadcn/ui を初期化
  ```bash
  npx shadcn-ui@latest init
  ```
- [x] 必要なコンポーネントをインストール
  - [x] `button`
  - [x] `input`
  - [x] `card`
  - [x] `scroll-area`
  - [x] `alert`

#### 1.3 環境変数設定
- [x] `.env.local` ファイルを作成（`.env.example` を参考に）
- [x] MongoDB接続文字列を設定
- [x] Anthropic APIキーを設定
- [x] `.env.local` を `.gitignore` に追加されていることを確認

---

### Phase 2: データベース設定 🗄️

#### 2.1 Prisma セットアップ
- [x] Prisma を初期化
  ```bash
  npx prisma init
  ```
- [x] `prisma/schema.prisma` を作成・設定
  - [x] datasource を MongoDB に設定
  - [x] Message モデルを定義
    - `id`: ObjectId
    - `role`: String ("user" | "assistant")
    - `content`: String
    - `createdAt`: DateTime
- [x] Prisma クライアントを生成
  ```bash
  npx prisma generate
  ```
- [x] スキーマをMongoDBにプッシュ（実際のMongoDB接続後に実行）
  ```bash
  npx prisma db push
  ```

#### 2.2 Prisma クライアント設定
- [x] `src/lib/prisma.ts` を作成
- [x] Prisma クライアントのシングルトンインスタンスを実装
- [x] 開発環境でのホットリロード対応

---

### Phase 3: API層実装（Hono） 🔌

#### 3.1 Hono セットアップ
- [x] `src/app/api/[[...route]]/route.ts` を作成
- [x] Hono アプリケーションを初期化
- [x] Next.js App Router と統合
- [x] CORS設定を追加

#### 3.2 Claude API クライアント
- [x] `src/lib/claude.ts` を作成
- [x] Anthropic クライアントを初期化
- [x] メッセージ送信関数を実装
- [x] エラーハンドリングを追加
- [x] レスポンス型定義

#### 3.3 API エンドポイント実装

##### 3.3.1 POST `/api/chat`
- [x] リクエストボディのバリデーション（Zod使用）
- [x] ユーザーメッセージをMongoDBに保存
- [x] 会話履歴を取得（最新50件程度）
- [x] Claude APIを呼び出し
- [x] アシスタントレスポンスをMongoDBに保存
- [x] 両方のメッセージを返却
- [x] エラーハンドリング実装
  - バリデーションエラー
  - データベースエラー
  - Claude APIエラー
  - レート制限エラー

##### 3.3.2 GET `/api/messages`
- [x] MongoDBから全メッセージを取得
- [x] 作成日時順にソート（昇順）
- [x] レスポンス形式を整形
- [x] エラーハンドリング

##### 3.3.3 POST `/api/reset`
- [x] 全メッセージを削除
- [x] 削除件数を返却
- [x] エラーハンドリング

#### 3.4 型定義
- [x] `src/types/index.ts` を作成
- [x] API リクエスト/レスポンス型を定義
- [x] Message型を定義
- [x] Claude API 関連型を定義

---

### Phase 4: フロントエンド実装 🎨

#### 4.1 レイアウト設定
- [x] `src/app/layout.tsx` を更新
  - メタデータ設定
  - フォント設定
  - グローバルスタイル適用

#### 4.2 UIコンポーネント作成

##### 4.2.1 `src/components/chat/MessageList.tsx`
- [x] メッセージ一覧表示コンポーネント
- [x] ユーザー/アシスタントメッセージの区別
- [x] 自動スクロール機能
- [x] ローディング状態表示
- [x] 空状態表示

##### 4.2.2 `src/components/chat/MessageInput.tsx`
- [x] テキスト入力フィールド
- [x] 送信ボタン
- [x] Enterキーで送信（Shift+Enterで改行）
- [x] 文字数制限（10,000文字）
- [x] 送信中は入力無効化

##### 4.2.3 `src/components/chat/ResetButton.tsx`
- [x] リセットボタン
- [x] 確認ダイアログ
- [x] ローディング状態

##### 4.2.4 `src/components/chat/ChatInterface.tsx`
- [x] メインチャットインターフェース
- [x] 上記コンポーネントを統合
- [x] 状態管理（useState, useEffect）
- [x] API呼び出しロジック
- [x] エラー表示

#### 4.3 メインページ
- [x] `src/app/page.tsx` を実装
- [x] ChatInterface コンポーネントを配置
- [x] ページレイアウト設定
- [x] クライアントコンポーネントとして設定

#### 4.4 ユーティリティ関数
- [x] `src/lib/utils.ts` を作成
- [x] 日付フォーマット関数
- [x] エラーメッセージ整形関数
- [x] その他ヘルパー関数

---

### Phase 5: スタイリング 💅

#### 5.1 Tailwind CSS 設定
- [ ] `tailwind.config.ts` をカスタマイズ
- [ ] カラーテーマ設定
- [ ] カスタムユーティリティクラス追加

#### 5.2 グローバルスタイル
- [ ] `src/app/globals.css` を更新
- [ ] CSS変数設定
- [ ] ダークモード対応（オプション）

#### 5.3 コンポーネントスタイル
- [ ] メッセージバブルのデザイン
- [ ] 入力フィールドのスタイル
- [ ] ボタンのホバー/アクティブ状態
- [ ] レスポンシブデザイン対応

---

### Phase 6: 機能強化とエラーハンドリング 🛡️

#### 6.1 入力バリデーション
- [ ] フロントエンドでの入力検証
  - 空メッセージチェック
  - 文字数制限
  - 不正文字チェック
- [ ] バックエンドでの入力検証（Zod）
- [ ] サニタイゼーション処理

#### 6.2 エラーハンドリング
- [ ] ネットワークエラー処理
- [ ] データベースエラー処理
- [ ] Claude APIエラー処理
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] エラーログ記録

#### 6.3 ローディング状態
- [ ] メッセージ送信中の表示
- [ ] ページ読み込み時のスケルトン
- [ ] リセット処理中の表示

#### 6.4 レート制限（オプション）
- [ ] シンプルなレート制限実装
- [ ] IPベース制限（10リクエスト/分）
- [ ] 429エラーレスポンス

---

### Phase 7: デプロイメント準備 🚀

#### 7.1 Dockerfile 作成
- [ ] `Dockerfile` を作成
- [ ] マルチステージビルド設定
  - deps ステージ
  - builder ステージ
  - runner ステージ
- [ ] Prisma クライアント生成を含める
- [ ] Next.js ビルド設定

#### 7.2 Next.js 設定
- [ ] `next.config.js` を更新
  - `output: 'standalone'` を設定
- [ ] 環境変数の扱いを確認

#### 7.3 Docker ローカルテスト
- [ ] Dockerイメージをビルド
  ```bash
  docker build -t ai-chatbot .
  ```
- [ ] ローカルでコンテナを実行
  ```bash
  docker run -p 8080:8080 --env-file .env.local ai-chatbot
  ```
- [ ] 動作確認

#### 7.4 Google Cloud Run 設定
- [ ] Google Cloud プロジェクト作成
- [ ] Secret Manager 設定
  - `ANTHROPIC_API_KEY` シークレット作成
  - `DATABASE_URL` シークレット作成
- [ ] Cloud Build 設定

#### 7.5 デプロイ
- [ ] Docker イメージをビルド
  ```bash
  gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chatbot
  ```
- [ ] Cloud Run にデプロイ
  ```bash
  gcloud run deploy ai-chatbot \
    --image gcr.io/PROJECT_ID/ai-chatbot \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated \
    --update-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
    --update-secrets DATABASE_URL=database-url:latest \
    --max-instances 2 \
    --min-instances 0 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300
  ```

---

### Phase 8: テストと最適化 🧪

#### 8.1 機能テスト
- [ ] メッセージ送信機能
- [ ] メッセージ履歴表示
- [ ] 会話リセット機能
- [ ] エラーハンドリング
- [ ] レスポンシブデザイン

#### 8.2 パフォーマンステスト
- [ ] 10並行ユーザーでの負荷テスト
- [ ] レスポンスタイム測定
- [ ] Cloud Run メトリクス確認
- [ ] データベース接続数確認

#### 8.3 セキュリティチェック
- [ ] 環境変数が適切に保護されているか
- [ ] XSS対策が実装されているか
- [ ] SQLインジェクション対策（Prismaで自動対応）
- [ ] CORS設定が適切か
- [ ] レート制限が機能しているか

#### 8.4 最適化
- [ ] パフォーマンスボトルネック特定
- [ ] データベースクエリ最適化
- [ ] フロントエンドバンドルサイズ削減
- [ ] 画像最適化（もしあれば）

---

## 📝 開発コマンド クイックリファレンス

```bash
# 開発サーバー起動
npm run dev

# Prisma クライアント生成
npx prisma generate

# スキーマをDBにプッシュ
npx prisma db push

# Prisma Studio起動
npx prisma studio

# プロダクションビルド
npm run build

# プロダクション実行
npm start

# Docker ビルド
docker build -t ai-chatbot .

# Docker 実行
docker run -p 8080:8080 --env-file .env.local ai-chatbot

# Cloud Run デプロイ
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chatbot
gcloud run deploy ai-chatbot --image gcr.io/PROJECT_ID/ai-chatbot [options]
```

---

## 🎯 マイルストーン

| Phase | 完了目標 | 期間目安 |
|-------|---------|---------|
| Phase 1 | プロジェクトセットアップ完了 | 1時間 |
| Phase 2 | データベース接続確立 | 30分 |
| Phase 3 | API層完成 | 2時間 |
| Phase 4 | フロントエンド実装完了 | 3時間 |
| Phase 5 | スタイリング完了 | 1時間 |
| Phase 6 | エラーハンドリング実装 | 1時間 |
| Phase 7 | デプロイ成功 | 1.5時間 |
| Phase 8 | テスト・最適化完了 | 1時間 |

**合計見積もり時間**: 約11時間

---

## ✅ 完了条件

このプロジェクトは以下の条件を満たした時点で完了とします：

1. ✅ ユーザーがメッセージを送信できる
2. ✅ Claude AIが応答を返す
3. ✅ 会話履歴が永続化される
4. ✅ 会話をリセットできる
5. ✅ エラーが適切に処理される
6. ✅ Cloud Run にデプロイ済み
7. ✅ HTTPSで本番URLにアクセス可能
8. ✅ 10並行ユーザーでの動作確認済み

---

## 🐛 既知の制限事項（仕様通り）

- 全ユーザーが同じ会話を共有
- 認証機能なし
- ストリーミングレスポンスなし
- 会話履歴の上限なし
- レート制限未実装（Phase 6で追加可能）

---

**作成日**: 2026-02-16
**最終更新**: 2026-02-16
**ステータス**: 実装開始待ち
