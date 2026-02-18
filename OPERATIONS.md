# AI Chatbot - システム構成・運用マニュアル

## 📋 目次

1. [システム概要](#システム概要)
2. [システム構成図](#システム構成図)
3. [技術スタック](#技術スタック)
4. [インフラ構成](#インフラ構成)
5. [デプロイメント](#デプロイメント)
6. [環境変数管理](#環境変数管理)
7. [監視とログ](#監視とログ)
8. [運用手順](#運用手順)
9. [トラブルシューティング](#トラブルシューティング)
10. [コスト管理](#コスト管理)
11. [セキュリティ](#セキュリティ)
12. [バックアップとリカバリ](#バックアップとリカバリ)

---

## システム概要

### プロジェクト情報
- **プロジェクト名**: AI Chatbot
- **目的**: Anthropic Claudeを利用したエンターテインメント向けAIチャットボット
- **対象ユーザー**: 一般公開（認証不要）
- **想定規模**: 5-10名の同時接続

### 主要機能
- ✅ Claude AIとのリアルタイム対話
- ✅ 会話履歴の永続化
- ✅ 会話リセット機能
- ✅ レスポンシブUIデザイン

---

## システム構成図

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                         ユーザー                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Run (asia-northeast1)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Application                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Frontend (React)                        │  │  │
│  │  │  - Chat Interface                               │  │  │
│  │  │  - Message Display                              │  │  │
│  │  │  - Input Form                                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         API Layer (Hono)                        │  │  │
│  │  │  - POST /api/chat                               │  │  │
│  │  │  - GET /api/messages                            │  │  │
│  │  │  - POST /api/reset                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Data Layer (Prisma)                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  設定: min-instances=0, max-instances=2                      │
│  リソース: 512Mi RAM, 1 CPU                                  │
└──────────┬───────────────────────────┬──────────────────────┘
           │                           │
           │                           │ Secret Manager
           │                           ↓
           │              ┌──────────────────────────┐
           │              │  Google Secret Manager   │
           │              │  - DATABASE_URL          │
           │              │  - ANTHROPIC_API_KEY     │
           │              └──────────────────────────┘
           │
           ↓
┌──────────────────────────┐         ┌──────────────────────────┐
│    MongoDB Atlas         │         │   Anthropic Claude API   │
│  - 会話履歴保存           │         │   - AI応答生成            │
│  - Message Collection    │         │   - Model: Sonnet 4.5    │
└──────────────────────────┘         └──────────────────────────┘
```

### CI/CDパイプライン

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│                  furuboko/ai-chatbot                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ git push origin main
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                   GitHub Actions                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  1. Checkout code                                      │  │
│  │  2. Authenticate (Workload Identity Federation)       │  │
│  │  3. Build Docker image                                 │  │
│  │  4. Push to Google Container Registry                 │  │
│  │  5. Deploy to Cloud Run                                │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│          Google Container Registry (GCR)                      │
│          gcr.io/crypto-reality-367506/ai-chatbot             │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                   Cloud Run Service                           │
│                   ai-chatbot                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1.6 | Reactフレームワーク |
| React | 18+ | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 3.x | スタイリング |
| shadcn/ui | Latest | UIコンポーネント |

### バックエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Hono | 4.x | APIフレームワーク |
| Prisma | 5.22.0 | ORM |
| Zod | 3.x | バリデーション |
| MongoDB | 7.x | データベース |

### インフラ・DevOps
| サービス | 用途 |
|---------|------|
| Google Cloud Run | コンテナホスティング |
| Google Container Registry | Dockerイメージストレージ |
| Google Secret Manager | 機密情報管理 |
| MongoDB Atlas | マネージドMongoDB |
| GitHub Actions | CI/CDパイプライン |
| Workload Identity Federation | 認証 |

### 外部サービス
| サービス | 用途 |
|---------|------|
| Anthropic Claude API | AI応答生成 |
| MongoDB Atlas | データベースホスティング |

---

## インフラ構成

### Google Cloud プロジェクト情報
- **プロジェクトID**: `crypto-reality-367506`
- **プロジェクト番号**: `772986507207`
- **リージョン**: `asia-northeast1` (東京)

### Cloud Run サービス設定

```yaml
サービス名: ai-chatbot
リージョン: asia-northeast1
イメージ: gcr.io/crypto-reality-367506/ai-chatbot:latest

リソース:
  CPU: 1
  メモリ: 512Mi

スケーリング:
  最小インスタンス: 0
  最大インスタンス: 2
  同時実行数: 80 (デフォルト)

タイムアウト: 300秒

認証: 未認証アクセス許可

環境変数:
  - DATABASE_URL (Secret Manager参照)
  - ANTHROPIC_API_KEY (Secret Manager参照)
  - CLAUDE_MODEL: claude-3-5-sonnet-20241022
  - CLAUDE_MAX_TOKENS: 4096
  - CLAUDE_TEMPERATURE: 1.0
  - CONVERSATION_HISTORY_LIMIT: 50

サービスアカウント:
  772986507207-compute@developer.gserviceaccount.com
```

### Container Registry
- **イメージリポジトリ**: `gcr.io/crypto-reality-367506/ai-chatbot`
- **タグ管理**:
  - `latest`: 最新の本番デプロイ
  - `<commit-sha>`: 各コミットのイメージ

### Secret Manager
- **database-url**: MongoDB接続文字列
- **anthropic-api-key**: Anthropic API キー

### IAM設定

#### Service Accounts

**1. Cloud Run実行用**
- **アカウント**: `772986507207-compute@developer.gserviceaccount.com`
- **ロール**:
  - Secret Manager Secret Accessor (Secret参照用)

**2. GitHub Actions用**
- **アカウント**: `github-actions-deploy@crypto-reality-367506.iam.gserviceaccount.com`
- **ロール**:
  - Cloud Run Admin (デプロイ用)
  - Storage Admin (GCR push用)
  - Service Account User (Cloud Run実行用)
  - Artifact Registry Writer (イメージpush用)

#### Workload Identity Federation
- **Pool**: `github-actions-pool`
- **Provider**: `github-provider`
- **許可リポジトリ**: `furuboko/ai-chatbot`
- **認証方式**: OIDC (OpenID Connect)

---

## デプロイメント

### 1. 自動デプロイ (推奨)

GitHub Actionsによる自動デプロイが設定されています。

**トリガー条件:**
- `main`ブランチへのpush
- 手動実行 (workflow_dispatch)

**デプロイフロー:**
```bash
# 1. コード変更をコミット
git add .
git commit -m "Update: 新機能追加"

# 2. GitHubにプッシュ
git push origin main

# 3. GitHub Actionsが自動実行
# - Dockerイメージビルド (約1-2分)
# - GCRへのpush (約30秒)
# - Cloud Runデプロイ (約30秒)
# 合計: 約2-3分
```

**進行状況の確認:**
```bash
# ワークフロー一覧を表示
gh run list --repo furuboko/ai-chatbot

# リアルタイムで監視
gh run watch <run-id> --repo furuboko/ai-chatbot

# または GitHub Actionsページで確認
https://github.com/furuboko/ai-chatbot/actions
```

### 2. 手動デプロイ

緊急時やローカルでのテスト時に使用します。

**手順:**

```bash
# 1. Google Cloud認証
gcloud auth login
gcloud config set project crypto-reality-367506

# 2. Dockerイメージビルド
gcloud builds submit --tag gcr.io/crypto-reality-367506/ai-chatbot

# 3. Cloud Runにデプロイ
gcloud run deploy ai-chatbot \
  --image gcr.io/crypto-reality-367506/ai-chatbot:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-secrets DATABASE_URL=database-url:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest
```

### 3. ロールバック

問題が発生した場合、以前のバージョンに戻すことができます。

```bash
# 1. 利用可能なリビジョンを確認
gcloud run revisions list \
  --service ai-chatbot \
  --region asia-northeast1

# 2. 特定のリビジョンにトラフィックを切り替え
gcloud run services update-traffic ai-chatbot \
  --region asia-northeast1 \
  --to-revisions <revision-name>=100

# 例: ai-chatbot-00001-abc に100%のトラフィックを送る
gcloud run services update-traffic ai-chatbot \
  --region asia-northeast1 \
  --to-revisions ai-chatbot-00001-abc=100
```

### 4. デプロイ前チェックリスト

- [ ] ローカルで`npm run build`が成功する
- [ ] TypeScriptのエラーがない
- [ ] 環境変数が正しく設定されている
- [ ] Prismaスキーマが最新
- [ ] 依存パッケージが最新（セキュリティ修正確認）
- [ ] .envファイルがコミットされていない

---

## 環境変数管理

### Secret Manager設定

**現在のシークレット:**

```bash
# シークレット一覧表示
gcloud secrets list

# シークレットの詳細確認
gcloud secrets describe database-url
gcloud secrets describe anthropic-api-key
```

**シークレットの更新:**

```bash
# DATABASE_URLの更新
echo -n "mongodb+srv://new-connection-string" | \
  gcloud secrets versions add database-url --data-file=-

# ANTHROPIC_API_KEYの更新
echo -n "sk-ant-new-api-key" | \
  gcloud secrets versions add anthropic-api-key --data-file=-

# 更新後、Cloud Runサービスを再デプロイ
gcloud run services update ai-chatbot \
  --region asia-northeast1
```

**シークレットの削除 (注意):**

```bash
# シークレット全体を削除
gcloud secrets delete database-url

# 特定のバージョンのみ無効化
gcloud secrets versions disable 1 --secret=database-url
```

### ローカル開発環境

`.env.local`ファイルを使用:

```bash
# .env.localファイルを作成
cp .env.example .env.local

# 以下を設定
DATABASE_URL="mongodb+srv://..."
ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
CONVERSATION_HISTORY_LIMIT=50
```

**重要:** `.env.local`はGitにコミットしないこと！

---

## 監視とログ

### Cloud Runログの確認

**リアルタイムログストリーミング:**
```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --limit 100 \
  --tail
```

**エラーログのみ表示:**
```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --log-filter 'severity>=ERROR'
```

**特定期間のログ:**
```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --filter 'timestamp>="2026-02-18T00:00:00Z"'
```

### Cloud Console での確認

**ログエクスプローラー:**
```
https://console.cloud.google.com/logs/query?project=crypto-reality-367506
```

フィルタ例:
```
resource.type="cloud_run_revision"
resource.labels.service_name="ai-chatbot"
severity>=ERROR
```

### メトリクス監視

**Cloud Runメトリクス:**
- リクエスト数
- レイテンシ
- エラー率
- アクティブインスタンス数
- CPU使用率
- メモリ使用率

**確認方法:**
```bash
# サービスの詳細を確認
gcloud run services describe ai-chatbot \
  --region asia-northeast1 \
  --format json

# Cloud Consoleで確認
https://console.cloud.google.com/run/detail/asia-northeast1/ai-chatbot/metrics?project=crypto-reality-367506
```

### アラート設定 (推奨)

Cloud Monitoringでアラートを設定:

```yaml
アラート例:
  - エラー率が5%を超えた場合
  - レイテンシが3秒を超えた場合
  - インスタンス数が上限に達した場合
  - リクエスト数が急増した場合
```

設定方法:
```
Cloud Console > Monitoring > Alerting > Create Policy
```

---

## 運用手順

### 日常運用

**毎日:**
- [ ] アプリケーションの動作確認（URL疎通チェック）
- [ ] エラーログの確認

**毎週:**
- [ ] Cloud Runメトリクスの確認
- [ ] コスト状況の確認
- [ ] 依存パッケージのセキュリティアップデート確認

**毎月:**
- [ ] MongoDB Atlasの容量確認
- [ ] API利用量の確認（Anthropic）
- [ ] パフォーマンスレビュー
- [ ] バックアップの動作確認

### メンテナンス作業

**依存パッケージの更新:**

```bash
# セキュリティ脆弱性のチェック
npm audit

# パッケージの更新
npm update

# または特定のパッケージを更新
npm update next react react-dom

# ビルドテスト
npm run build

# 問題なければコミット＆プッシュ
git add package.json package-lock.json
git commit -m "chore: Update dependencies"
git push origin main
```

**Prismaスキーマの変更:**

```bash
# スキーマ変更後
npx prisma generate
npx prisma db push

# マイグレーション作成（本番推奨）
npx prisma migrate dev --name add_new_field

# 本番環境に適用
npx prisma migrate deploy
```

### スケールアップ/ダウン

**インスタンス数の調整:**

```bash
# 最大インスタンス数を増やす
gcloud run services update ai-chatbot \
  --region asia-northeast1 \
  --max-instances 5

# 最小インスタンスを設定（常時起動）
gcloud run services update ai-chatbot \
  --region asia-northeast1 \
  --min-instances 1
```

**リソースの調整:**

```bash
# メモリとCPUの増強
gcloud run services update ai-chatbot \
  --region asia-northeast1 \
  --memory 1Gi \
  --cpu 2
```

### データベースメンテナンス

**MongoDB Atlasでの作業:**

```bash
# 会話履歴の件数確認
# MongoDB Atlasコンソールまたは以下のスクリプトで確認
```

**古いデータの削除 (必要に応じて):**

```javascript
// MongoDB ShellまたはCompass
db.messages.deleteMany({
  createdAt: { $lt: new Date('2026-01-01') }
})
```

---

## トラブルシューティング

### 問題: アプリケーションにアクセスできない

**確認手順:**

1. **サービスの状態確認**
```bash
gcloud run services describe ai-chatbot \
  --region asia-northeast1 \
  --format='value(status.conditions.status)'
```

2. **最新のログを確認**
```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --limit 50
```

3. **エラーログをフィルタ**
```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --log-filter 'severity>=ERROR' \
  --limit 20
```

**よくある原因:**
- Secret Managerの環境変数が設定されていない
- MongoDBへの接続が失敗している
- Anthropic APIキーが無効

### 問題: デプロイが失敗する

**GitHub Actions のログを確認:**

```bash
gh run list --repo furuboko/ai-chatbot --limit 1
gh run view <run-id> --log-failed --repo furuboko/ai-chatbot
```

**よくある原因:**
- Dockerビルドエラー（依存パッケージの問題）
- 権限エラー（IAMロールの不足）
- Secret Managerアクセス権限の問題
- ビルド時の環境変数エラー

**解決方法:**

```bash
# 権限の再確認
gcloud projects get-iam-policy crypto-reality-367506 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-deploy@*"

# Secret Managerアクセス権限を再付与
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:772986507207-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 問題: Claude APIエラー

**エラーメッセージの確認:**

```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --log-filter 'textPayload=~"anthropic"'
```

**よくある原因:**
- APIキーの期限切れ
- レート制限超過
- APIクレジット不足

**解決方法:**

1. Anthropicコンソールで確認: https://console.anthropic.com/
2. APIキーを再生成して更新
```bash
echo -n "sk-ant-new-api-key" | \
  gcloud secrets versions add anthropic-api-key --data-file=-
```

### 問題: MongoDBに接続できない

**接続文字列の確認:**

```bash
# Secret Managerの値を確認（権限が必要）
gcloud secrets versions access latest --secret=database-url
```

**よくある原因:**
- MongoDB Atlasのネットワークアクセス設定
- IPホワイトリストの問題
- データベースクラスターの停止

**解決方法:**

1. MongoDB Atlasで確認:
   - Network Access設定を確認
   - Database Accessでユーザー権限を確認
   - Clusterが起動しているか確認

2. 接続文字列を更新
```bash
echo -n "新しい接続文字列" | \
  gcloud secrets versions add database-url --data-file=-
```

### 問題: メモリ不足エラー

**ログで確認:**

```bash
gcloud run logs read \
  --service ai-chatbot \
  --region asia-northeast1 \
  --log-filter 'textPayload=~"memory"'
```

**解決方法:**

```bash
# メモリを増やす
gcloud run services update ai-chatbot \
  --region asia-northeast1 \
  --memory 1Gi
```

### 緊急対応フロー

**サービスが完全にダウンした場合:**

```bash
# 1. 最新のエラーログを確認
gcloud run logs read --service ai-chatbot --region asia-northeast1 --limit 100

# 2. 以前の正常動作していたリビジョンにロールバック
gcloud run revisions list --service ai-chatbot --region asia-northeast1
gcloud run services update-traffic ai-chatbot \
  --region asia-northeast1 \
  --to-revisions <previous-revision>=100

# 3. 問題の調査と修正

# 4. 修正版をデプロイ
git push origin main
```

---

## コスト管理

### 月額コスト見積もり（5-10ユーザー想定）

| サービス | 使用量 | 月額（概算） |
|---------|-------|------------|
| **Cloud Run** | | |
| - CPU時間 | 10-20 vCPU時間/月 | ¥70-140 |
| - メモリ | 10-20 GiB時間/月 | ¥15-30 |
| - リクエスト | 10,000-50,000/月 | ¥0-5 |
| **Container Registry** | | |
| - ストレージ | ~5GB | ¥50 |
| - ネットワーク | ~1GB/月 | ¥10 |
| **Secret Manager** | | |
| - アクセス | ~10,000回/月 | ¥3 |
| **MongoDB Atlas** | | |
| - M0 Free Tier | 512MB | ¥0 |
| **Anthropic Claude API** | | |
| - 50,000トークン/日 | 約1.5M トークン/月 | ¥1,500-3,000 |
| **合計** | | **¥1,650-3,250/月** |

### コスト最適化のポイント

**1. Cloud Runの最適化:**
- 最小インスタンス0に設定（コールドスタート許容）
- 必要最小限のメモリ設定（512Mi）
- タイムアウトを適切に設定（300秒）

**2. MongoDB Atlasの最適化:**
- Free Tier（M0）を活用
- 古い会話履歴の定期削除
- インデックスの最適化

**3. Claude APIの最適化:**
- 会話履歴の制限（50メッセージ）
- トークン数の制限（4096）
- 不要なコンテキストの削減

### コスト監視

**Cloud Billingレポート:**
```
https://console.cloud.google.com/billing/reports?project=crypto-reality-367506
```

**予算アラートの設定:**

```bash
# 予算設定（Cloud Console推奨）
# Billing > Budgets & alerts
# 例: 月額5,000円でアラート設定
```

**日次コストの確認:**

```bash
# BigQueryでコストクエリ（要設定）
# または Cloud Console Billingページで確認
```

---

## セキュリティ

### 実装済みセキュリティ対策

**1. 認証・認可**
- ✅ Workload Identity Federation（GitHub Actions）
- ✅ Service Account最小権限の原則
- ✅ Secret Managerでの機密情報管理

**2. ネットワークセキュリティ**
- ✅ HTTPS強制（Cloud Run自動）
- ✅ CORS設定
- ✅ Rate Limiting実装

**3. アプリケーションセキュリティ**
- ✅ 入力バリデーション（Zod）
- ✅ SQLインジェクション対策（Prisma ORM）
- ✅ XSS対策（Reactの自動エスケープ）
- ✅ 環境変数の暗号化保存

**4. 依存パッケージ**
- ✅ npm audit定期実行
- ✅ Dependabot有効化推奨

### セキュリティチェックリスト

**定期確認項目:**

- [ ] 依存パッケージの脆弱性スキャン（週次）
```bash
npm audit
npm audit fix
```

- [ ] APIキーのローテーション（四半期）
```bash
# Anthropic APIキーを再生成
# Secret Managerで更新
```

- [ ] IAM権限の見直し（四半期）
```bash
gcloud projects get-iam-policy crypto-reality-367506
```

- [ ] ログの異常検知（週次）
```bash
# 異常なアクセスパターンの確認
gcloud run logs read --service ai-chatbot --region asia-northeast1 \
  --log-filter 'severity>=WARNING'
```

### インシデント対応

**不正アクセスを検知した場合:**

1. **即座の対応:**
```bash
# サービスを一時停止
gcloud run services update ai-chatbot \
  --region asia-northeast1 \
  --no-allow-unauthenticated

# または完全停止
gcloud run services delete ai-chatbot --region asia-northeast1
```

2. **ログの保存:**
```bash
# すべてのログをエクスポート
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 10000 \
  --format json > incident-logs-$(date +%Y%m%d).json
```

3. **APIキーのローテーション:**
```bash
# Anthropic APIキーを即座に無効化＆再生成
# MongoDB接続文字列の変更
```

4. **原因調査と再発防止策の実施**

---

## バックアップとリカバリ

### データバックアップ

**MongoDB Atlas（自動バックアップ）:**
- Free Tierではバックアップ機能制限あり
- 有料プラン（M10+）で自動バックアップ有効

**手動バックアップ（推奨）:**

```bash
# mongodumpを使用したエクスポート
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# または MongoDB Compassでエクスポート
# Collections > messages > Export Data
```

**定期バックアップスクリプト:**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backups/${DATE}"

# MongoDB export
mongodump --uri="${DATABASE_URL}" --out="${BACKUP_DIR}"

# Google Cloud Storageにアップロード（オプション）
tar -czf "${BACKUP_DIR}.tar.gz" "${BACKUP_DIR}"
gsutil cp "${BACKUP_DIR}.tar.gz" gs://your-backup-bucket/

echo "Backup completed: ${BACKUP_DIR}"
```

### リカバリ手順

**データベースの復元:**

```bash
# mongorestore を使用
mongorestore --uri="mongodb+srv://..." --dir=backup-20260218/

# 特定のコレクションのみ復元
mongorestore --uri="mongodb+srv://..." --dir=backup-20260218/ \
  --nsInclude="chatbot.messages"
```

**アプリケーションの復元:**

```bash
# 以前のDockerイメージにロールバック
gcloud run deploy ai-chatbot \
  --image gcr.io/crypto-reality-367506/ai-chatbot:<commit-sha> \
  --region asia-northeast1
```

### ディザスタリカバリ計画

**RTO (Recovery Time Objective): 1時間**
**RPO (Recovery Point Objective): 24時間**

**手順:**

1. **データベース復元** (15分)
   - 最新バックアップからMongoDB復元

2. **アプリケーション復元** (15分)
   - 正常動作していたDockerイメージをデプロイ

3. **動作確認** (15分)
   - エンドツーエンドテスト
   - ログ確認

4. **サービス再開** (15分)
   - DNSの確認
   - ユーザー通知

---

## 付録

### よく使うコマンド集

```bash
# === Cloud Run ===
# サービス一覧
gcloud run services list --region asia-northeast1

# サービス詳細
gcloud run services describe ai-chatbot --region asia-northeast1

# ログ表示（リアルタイム）
gcloud run logs tail --service ai-chatbot --region asia-northeast1

# リビジョン一覧
gcloud run revisions list --service ai-chatbot --region asia-northeast1

# === GitHub Actions ===
# ワークフロー実行一覧
gh run list --repo furuboko/ai-chatbot

# ワークフローの監視
gh run watch <run-id> --repo furuboko/ai-chatbot

# 手動トリガー
gh workflow run deploy.yml --repo furuboko/ai-chatbot

# === Secret Manager ===
# シークレット一覧
gcloud secrets list

# シークレットの値を表示
gcloud secrets versions access latest --secret=database-url

# シークレット更新
echo -n "new-value" | gcloud secrets versions add secret-name --data-file=-

# === Container Registry ===
# イメージ一覧
gcloud container images list --repository=gcr.io/crypto-reality-367506

# タグ一覧
gcloud container images list-tags gcr.io/crypto-reality-367506/ai-chatbot
```

### リンク集

**Google Cloud:**
- [Cloud Runコンソール](https://console.cloud.google.com/run?project=crypto-reality-367506)
- [Cloud Logsエクスプローラー](https://console.cloud.google.com/logs?project=crypto-reality-367506)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=crypto-reality-367506)
- [Billing](https://console.cloud.google.com/billing?project=crypto-reality-367506)
- [IAM](https://console.cloud.google.com/iam-admin?project=crypto-reality-367506)

**GitHub:**
- [リポジトリ](https://github.com/furuboko/ai-chatbot)
- [GitHub Actions](https://github.com/furuboko/ai-chatbot/actions)
- [Secrets設定](https://github.com/furuboko/ai-chatbot/settings/secrets/actions)

**外部サービス:**
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Anthropic Console](https://console.anthropic.com/)

**ドキュメント:**
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Claude API ドキュメント](https://docs.anthropic.com/)

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| 2026-02-18 | 1.0.0 | 初版作成 | Claude Code |

---

**最終更新**: 2026-02-18
**ドキュメントオーナー**: Development Team
**レビューサイクル**: 四半期ごと
