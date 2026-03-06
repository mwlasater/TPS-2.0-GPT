import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell } from "./components/app-shell.js";
import { DashboardPage } from "./features/shell/dashboard.js";
import { demoSession } from "./lib/session.js";
export function App() {
    return (_jsxs(AppShell, { children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Authenticated as" }), _jsx("strong", { children: demoSession.displayName })] }), _jsxs("div", { className: "topbar-chip", children: [_jsx("span", { children: "Property scope" }), _jsx("strong", { children: demoSession.allowedProperties.join(", ") })] })] }), _jsx(DashboardPage, {})] }));
}
