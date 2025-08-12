import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function BillingLayout() {
  const location = useLocation();
  const tabs = [
    { label: "Overview", to: "/billing" },
    { label: "Gateway", to: "/billing/gateway" },
    { label: "Logs", to: "/billing/logs" },
    { label: "Chargebacks", to: "/billing/chargebacks" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-600">Payments, gateway, logs, and chargebacks</p>
        </div>
        <div className="px-2">
          <nav className="flex gap-2 px-4 pb-3">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors border " +
                    (isActive
                      ? "bg-green-50 text-green-700 border-purple-400"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200")
                  }
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}