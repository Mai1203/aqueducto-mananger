import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
