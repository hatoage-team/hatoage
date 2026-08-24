import type { Metadata } from 'next';
import MailRegistration from '@/components/MailRegistration';

export const metadata: Metadata = {
  title: 'メール登録',
  description: 'はとあげマートから最新の「今日のはとあげ」を受け取るメールマガジン登録。'
};

export default function MailPage() {
  return <main><MailRegistration /></main>;
}
