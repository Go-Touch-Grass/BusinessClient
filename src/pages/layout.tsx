export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div>{children}</div>;
}
