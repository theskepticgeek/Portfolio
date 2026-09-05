import "./globals.css";

export const metadata = {
  title: "Krrobius Strip",
  description: "Interactive portfolio of Krrish Dubey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
