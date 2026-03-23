import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: '免責事項・広告について | ふるさと納税トラッカー',
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        <div>
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">免責事項・広告について</h1>
          <p className="text-xs text-gray-400 mt-1">最終更新日：2025年1月</p>
        </div>

        {/* Affiliate disclosure — prominent, required by 景品表示法 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">📢 広告・アフィリエイトについて</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            本サービスは<strong>楽天アフィリエイト</strong>、さとふるアフィリエイト、
            ふるさとチョイスアフィリエイト等のアフィリエイトプログラムに参加しています。
            マップの返礼品一覧に含まれる楽天・さとふる・チョイスへのリンクはアフィリエイトリンクです。
            リンクをクリックして寄付・購入された場合、当サービスに報酬が支払われる場合がありますが、
            <strong>お客様の寄付額・購入価格には一切影響しません</strong>。
            掲載する返礼品はふるさと納税の人気・品質に基づいて独自に選定しており、
            報酬の有無によって推薦内容を変えることはありません。
          </p>
        </div>

        <Section title="税額計算の免責事項">
          <p className="mb-3">
            本サービスの控除上限額シミュレーターは、給与所得者を対象とした<strong>目安計算</strong>です。
            以下の点にご注意ください。
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
            <li>社会保険料は年収の15%で概算しており、実際の金額と異なる場合があります</li>
            <li>医療費控除・配当控除・事業所得・副業収入等は考慮していません</li>
            <li>2024年（令和6年）度の税率・控除額を基に計算しています</li>
            <li>計算結果に基づく寄付によって生じた不利益について、当サービスは一切責任を負いません</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            正確な控除上限額は、税理士・各自治体の担当窓口、または
            <a href="https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/furusato/mechanism/deduction.html"
              target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              総務省の公式ページ
            </a>
            でご確認ください。
          </p>
        </Section>

        <Section title="返礼品情報の免責事項">
          <p>
            掲載している返礼品情報（品名・金額・リンク）は掲載時点の情報であり、
            実際の返礼品の内容・在庫・最低寄付金額は各ふるさと納税サイトでご確認ください。
            情報の正確性については万全を期していますが、最新性を保証するものではありません。
          </p>
        </Section>

        <Section title="データの取り扱い">
          <p>
            本サービスに記録した寄付データはお使いの端末のブラウザ（localStorage）にのみ保存されます。
            当サービスのサーバーには送信・保存されません。
            ブラウザのキャッシュ削除や端末の変更によりデータが消失する可能性があります。
            大切なデータは設定ページより定期的にエクスポートすることをお勧めします。
          </p>
        </Section>

        <Section title="外部サービスへのリンク">
          <p>
            本サービスからリンクしている外部サービス（楽天市場、さとふる、ふるさとチョイス等）の
            内容・サービスについて、当サービスは責任を負いません。
            各外部サービスの利用規約・プライバシーポリシーをご確認ください。
          </p>
        </Section>

        <Section title="サービスの変更・中断">
          <p>
            本サービスは予告なく内容の変更・機能の追加削除・サービスの中断・終了を行う場合があります。
            これにより生じた損害について、当サービスは一切の責任を負いません。
          </p>
        </Section>

        <div className="text-center pt-2">
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
            プライバシーポリシーはこちら
          </Link>
        </div>

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
