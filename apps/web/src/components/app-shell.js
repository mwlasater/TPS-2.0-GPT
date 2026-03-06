import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const navigation = [
    "Dashboard",
    "Schedules",
    "Train Runs",
    "Delays",
    "Crew",
    "Reporting",
    "Settings"
];
export function AppShell({ children }) {
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { children: [_jsx("div", { className: "brand-mark", children: "HERZOG" }), _jsx("p", { className: "brand-subtitle", children: "Transit Property Software 2.0" })] }), _jsx("nav", { className: "nav-list", "aria-label": "Primary", children: navigation.map((item, index) => (_jsx("a", { className: index === 0 ? "nav-item active" : "nav-item", href: "/", children: item }, item))) }), _jsx("div", { className: "version-block", children: "v0.1.0 foundation" })] }), _jsx("main", { className: "content-shell", children: children })] }));
}
