# AI Chatbot - Claude Powered

エンターテイメント向けAIチャットボットアプリケーション。Anthropic Claudeを使用した、シンプルで使いやすい会話インターフェースを提供します。

## 📋 目次

- [特徴](#特徴)
- [技術スタック](#技術スタック)
- [前提条件](#前提条件)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [デプロイ](#デプロイ)
- [Makefileコマンド](#makefileコマンド)
- [環境変数](#環境変数)
- [トラブルシューティング](#トラブルシューティング)

## ✨ 特徴

- 💬 **シンプルなチャットインターフェース**: 直感的なUI/UX
- 🤖 **Claude AI統合**: Anthropic Claude 3.5 Sonnet搭載
- 💾 **会話履歴の永続化**: MongoDBで会話を保存
- 🎨 **モダンなUI**: shadcn/ui + Tailwind CSS
- 🚀 **簡単デプロイ**: Google Cloud Run対応
- 🔄 **リセット機能**: ワンクリックで会話をクリア

## 🛠 技術スタック

### フロントエンド・バックエンド
- **Next.js 14+** (App Router)
- **TypeScript**
- **Hono** (API Layer)
- **React 18+**
- **Tailwind CSS** + **shadcn/ui**

### データベース
- **MongoDB** (Prisma ORM)

### AI
- **Anthropic Claude API** (@anthropic-ai/sdk)

### デプロイ
- **Google Cloud Run**
- **Docker**

## 📦 前提条件

- **Node.js** 20.x以上
- **npm** または **yarn**
- **MongoDB Atlas** アカウント（または MongoDB インスタンス）
- **Anthropic API Key** ([取得はこちら](https://console.anthropic.com/))
- **Google Cloud** アカウント（デプロイ時）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <your-repository-url>
cd claude_mcp_teest
```

### 2. 依存関係のインストール

```bash
make install
# または
npm install
```

### 3. 環境変数の設定

`.env.example`を`.env.local`にコピーし、必要な値を設定します：

```bash
cp .env.example .env.local
```

`.env.local`を編集：

```bash
# MongoDB接続文字列
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# Anthropic API Key
ANTHROPIC_API_KEY="sk-ant-api-key-here"

# オプション設定
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

#### MongoDB Atlas設定方法

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にアクセス
2. 無料クラスターを作成
3. データベースユーザーを作成
4. ネットワークアクセス設定で、IPアドレスを許可（開発時は`0.0.0.0/0`）
5. 接続文字列を取得し、`DATABASE_URL`に設定

#### Anthropic API Key取得方法

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウント作成・ログイン
3. API Keysセクションで新しいキーを作成
4. キーを`ANTHROPIC_API_KEY`に設定

### 4. Prismaスキーマの適用

```bash
make db-push
# または
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
make dev
# または
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 💻 開発

### プロジェクト構造

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # メインページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── api/
│   │       └── [[...route]]/  # Hono API routes
│   ├── components/
│   │   ├── chat/              # チャット関連コンポーネント
│   │   └── ui/                # shadcn/ui コンポーネント
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── claude.ts          # Claude API client
│   │   └── utils.ts           # ユーティリティ
│   └── types/
│       └── index.ts           # TypeScript型定義
├── prisma/
│   └── schema.prisma          # Prismaスキーマ
├── Dockerfile                 # Cloud Run用
├── Makefile                   # 開発コマンド
└── CLAUDE.md                  # プロジェクト仕様書
```

### API エンドポイント

#### POST `/api/chat`
メッセージを送信し、Claudeの応答を取得

**Request:**
```json
{
  "message": "こんにちは"
}
```

**Response:**
```json
{
  "success": true,
  "userMessage": { "id": "...", "role": "user", "content": "こんにちは", ... },
  "assistantMessage": { "id": "...", "role": "assistant", "content": "こんにちは！", ... }
}
```

#### GET `/api/messages`
会話履歴を取得

#### POST `/api/reset`
会話履歴をクリア

#### GET `/api/health`
ヘルスチェック

### Prisma Studio（データベースGUI）

```bash
make studio
# または
npx prisma studio
```

ブラウザで http://localhost:5555 にアクセス

## 🐳 Docker

### ローカルでDockerビルド・実行

```bash
# ビルド
make docker-build

# 実行
make docker-run

# ビルド→実行（テスト用）
make test-local
```

## ☁️ デプロイ

### Google Cloud Run へのデプロイ

#### 1. GCPプロジェクトの設定

```bash
# GCP CLIのインストール確認
gcloud --version

# ログイン
gcloud auth login

# プロジェクト作成（または既存プロジェクト選択）
gcloud projects create PROJECT_ID
gcloud config set project PROJECT_ID

# Cloud Run APIを有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 2. Secret Managerでシークレット管理（推奨）

```bash
# シークレットを作成（対話形式）
make create-secrets

# または手動で作成
echo -n "sk-ant-..." | gcloud secrets create anthropic-api-key --data-file=-
echo -n "mongodb+srv://..." | gcloud secrets create database-url --data-file=-
```

#### 3. デプロイ実行

**Makefileを使用（推奨）:**

```bash
# Makefileの変数を環境に合わせて変更
# PROJECT_ID=your-gcp-project-id

# フルデプロイ
make deploy PROJECT_ID=your-project-id

# または手動で段階的に
make deploy-build PROJECT_ID=your-project-id  # Docker imageビルド
make deploy-run PROJECT_ID=your-project-id    # Cloud Runデプロイ

# Secret Manager使用の場合
make deploy-secrets PROJECT_ID=your-project-id
```

**手動デプロイ:**

```bash
# Docker imageをビルドしてGCRにpush
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chatbot

# Cloud Runにデプロイ
gcloud run deploy ai-chatbot \
  --image gcr.io/PROJECT_ID/ai-chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=mongodb+srv://... \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-... \
  --max-instances 2 \
  --min-instances 0 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300
```

#### 4. デプロイ後の確認

デプロイが完了すると、URLが表示されます：
```
Service [ai-chatbot] deployed to [https://ai-chatbot-xxx.a.run.app]
```

ブラウザでアクセスして動作を確認してください。

## 📝 Makefileコマンド

### 初期セットアップ
```bash
make install        # 依存関係のインストール
make init           # プロジェクト初期化（install + prisma generate）
make db-push        # Prismaスキーマの適用
```

### 開発
```bash
make dev            # 開発サーバー起動
make build          # プロダクションビルド
make start          # プロダクションモード起動
make studio         # Prisma Studio起動
```

### Docker
```bash
make docker-build   # Dockerイメージビルド
make docker-run     # Dockerコンテナ起動
make test-local     # ローカルDockerテスト
```

### デプロイ
```bash
make deploy              # フルデプロイ（build + deploy）
make deploy-build        # Docker imageビルド
make deploy-run          # Cloud Runデプロイ
make deploy-secrets      # Secret Manager使用デプロイ
make create-secrets      # Secret Manager作成
```

### その他
```bash
make clean          # ビルド成果物削除
make fresh          # クリーンインストール
make help           # ヘルプ表示
```

## 🔐 環境変数

### 必須

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | MongoDB接続文字列 | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `ANTHROPIC_API_KEY` | Anthropic API Key | `sk-ant-api-...` |

### オプション

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `CLAUDE_MODEL` | `claude-3-5-sonnet-20241022` | 使用するClaudeモデル |
| `CLAUDE_MAX_TOKENS` | `4096` | 最大トークン数 |
| `CLAUDE_TEMPERATURE` | `1.0` | 応答のランダム性（0.0-1.0） |
| `NODE_ENV` | `development` | 実行環境 |

## 🐛 トラブルシューティング

### 1. Prisma Client生成エラー

**エラー:** `Error: @prisma/client did not initialize yet`

**解決方法:**
```bash
npx prisma generate
```

### 2. MongoDB接続エラー

**エラー:** `MongoServerError: bad auth`

**解決方法:**
- `DATABASE_URL`の認証情報を確認
- MongoDB Atlasでユーザーのパスワードをリセット
- ネットワークアクセス設定を確認

### 3. Claude APIエラー

**エラー:** `Claude API Error: 401`

**解決方法:**
- `ANTHROPIC_API_KEY`が正しいか確認
- [Anthropic Console](https://console.anthropic.com/)でAPIキーの有効性を確認
- API使用量制限を確認

### 4. Docker buildエラー

**エラー:** `Error: Cannot find module 'next'`

**解決方法:**
```bash
# node_modules削除して再インストール
make clean
make install
make docker-build
```

### 5. Cloud Runデプロイエラー

**エラー:** `ERROR: (gcloud.run.deploy) PERMISSION_DENIED`

**解決方法:**
```bash
# 必要なAPI有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 権限確認
gcloud projects get-iam-policy PROJECT_ID
```

### 6. 環境変数が読み込まれない

**開発環境:**
- `.env.local`ファイルが存在するか確認
- ファイル名が正確か確認（`.env`ではなく`.env.local`）

**本番環境（Cloud Run）:**
- Secret Managerまたは環境変数設定を確認
- Cloud Runコンソールで環境変数を確認

### 7. メッセージが送信できない

**確認項目:**
1. ブラウザのコンソールでエラーを確認
2. ネットワークタブでAPIリクエストを確認
3. サーバーログを確認
   ```bash
   # 開発環境
   ターミナルのログを確認

   # Cloud Run
   gcloud run logs read ai-chatbot --region asia-northeast1
   ```

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 📄 ライセンス

MIT

## 👥 貢献

プルリクエストを歓迎します！

## 📞 サポート

問題が発生した場合は、Issueを作成してください。

---

**開発者**: Claude Code
**最終更新**: 2026-02-17
