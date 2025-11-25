// This is the root layout that doesn't have access to the locale.
// It's absolutely necessary for next-intl to work correctly.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
