import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | ふるさと納税トラッカー',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        <div>
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">プライバシーポリシー</h1>
          <p className="text-xs text-gray-400 mt-1">最終更新日：2025年1月</p>
        </div>

        <Section title="1. 基本方針">
          <p>
            ふるさと納税トラッカー（以下「本サービス」）は、ユーザーのプライバシーを尊重します。
            本ポリシーは、本サービスにおける個人情報の取り扱いについて説明します。
          </p>
        </Section>

        <Section title="2. 収集する情報">
          <p className="mb-3">
            本サービスは<strong>サーバーへのデータ送信を一切行いません</strong>。
            寄付記録・税務設定・プランはすべてお使いのブラウザの
            <code className="bg-gray-100 px-1 rounded text-gray-700">localStorage</code>
            にのみ保存されます。
          </p>
          <p>
            ただし、以下の情報が自動的に収集される場合があります。
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>アクセス解析（Vercel Analytics）：</strong>
              ページビュー数・デバイス種別・国・リファラー等の匿名の集計データ。
              個人を特定できる情報は含まれません。
            </li>
            <li>
              <strong>アフィリエイトリンクのクリック：</strong>
              楽天・さとふる・ふるさとチョイス等の外部サイトへのリンクをクリックした場合、
              各サービスのプライバシーポリシーに従って情報が収集されることがあります。
            </li>
          </ul>
        </Section>

        <Section title="3. アフィリエイトプログラムについて">
          <p>
            本サービスは楽天アフィリエイト・さとふるアフィリエイト・ふるさとチョイスアフィリエイト等の
            広告プログラムに参加しています。返礼品リンクをクリックして寄付・購入された場合、
            本サービスに報酬が支払われることがあります。この仕組みにより、
            <strong>ユーザーが支払う金額は変わりません</strong>。
          </p>
        </Section>

        <Section title="4. Cookieについて">
          <p>
            本サービス自体はCookieを使用しません。
            ただし、アフィリエイトリンク経由でアクセスした外部サイト（楽天市場など）では、
            各サービスのポリシーに基づきCookieが使用される場合があります。
          </p>
        </Section>

        <Section title="5. データのセキュリティ">
          <p>
            すべての寄付データはお使いの端末のローカルストレージにのみ保存されるため、
            当サービスのサーバーに送信・保存されることはありません。
            ブラウザのデータ消去や端末の変更によりデータが失われることがありますので、
            設定ページからの定期的なエクスポートをお勧めします。
          </p>
        </Section>

        <Section title="6. 外部リンク">
          <p>
            本サービスに含まれる外部サイトへのリンク先について、
            当サービスは責任を負いません。各外部サービスのプライバシーポリシーをご確認ください。
          </p>
        </Section>

        <Section title="7. ポリシーの変更">
          <p>
            本ポリシーは予告なく変更することがあります。
            重要な変更がある場合はサービス内でお知らせします。
            継続してサービスを利用することで、変更後のポリシーに同意したものとみなします。
          </p>
        </Section>

        <Section title="8. お問い合わせ">
          <p>
            本ポリシーに関するご質問はGitHubリポジトリのIssueよりお問い合わせください。
          </p>
        </Section>

      </div>
      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 px-6 py-5 space-y-2">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  )
}
