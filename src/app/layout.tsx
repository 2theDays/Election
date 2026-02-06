import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "2026 충북도지사 선거 전략 지휘소",
    description: "실시간 네트워크 분석 및 지지율 시뮬레이션 대시보드",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
