import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface Props {
  messages: any;
  locale: string;
  children: ReactNode;
}

export default function NextIntlProvider({ messages, locale, children }: Props) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
