import { Helmet, HelmetProvider } from "react-helmet-async";
import type { ReactNode } from "react";

export const Seo = ({ title, description }: { title: string; description?: string }) => (
  <Helmet>
    <title>{title}</title>
    {description ? <meta name="description" content={description} /> : null}
  </Helmet>
);

export const SeoProvider = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);
