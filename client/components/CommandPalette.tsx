import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  const sections: { heading: string; items: { label: string; to: string }[] }[] = [
    {
      heading: "General",
      items: [
        { label: "Overview", to: "/" },
        { label: "Members", to: "/member-portal" },
        { label: "Clients", to: "/client-portal" },
        { label: "Integrations", to: "/integrations" },
        { label: "Settings", to: "/settings" },
      ],
    },
    {
      heading: "Marketing",
      items: [
        { label: "Campaigns", to: "/marketing-automation" },
        { label: "Campaign Scheduler", to: "/marketing-automation/scheduler" },
      ],
    },
    {
      heading: "Billing",
      items: [
        { label: "Billing Overview", to: "/billing" },
        { label: "Gateway", to: "/billing/gateway" },
        { label: "Logs", to: "/billing/logs" },
        { label: "Chargebacks", to: "/billing/chargebacks" },
      ],
    },
    {
      heading: "Operations",
      items: [
        { label: "Admin Center", to: "/admin" },
        { label: "DevOps Center", to: "/devops" },
        { label: "Test Module", to: "/test" },
      ],
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div
        className="mx-auto max-w-xl rounded-lg bg-white shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Palette">
          <div className="border-b p-2">
            <Command.Input ref={inputRef} placeholder="Type a command or search..." className="w-full px-3 py-2 outline-none" />
          </div>
          <Command.List className="max-h-80 overflow-auto p-1">
            <Command.Empty className="px-3 py-2 text-sm text-gray-500">No results found.</Command.Empty>
            {sections.map((section) => (
              <Command.Group key={section.heading} heading={section.heading} className="px-2 py-1">
                {section.items.map((item) => (
                  <Command.Item
                    key={item.to}
                    value={`${section.heading}: ${item.label}`}
                    onSelect={() => go(item.to)}
                    className="flex items-center gap-2 rounded px-2 py-2 text-sm data-[selected=true]:bg-gray-100 cursor-pointer"
                  >
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}