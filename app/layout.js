import "./globals.css";

export const metadata = {
  title: "Krrobius Strip",
  description: "Where Euclid meets Van Gogh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
