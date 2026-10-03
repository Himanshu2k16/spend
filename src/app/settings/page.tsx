"use client";

import { PageHeader } from "@/shared/components/page-header";
import { SettingsPanels } from "@/modules/settings/components/settings-panels";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        index="05"
        overline="Control room"
        title="Settings"
        subtitle="Tune how Spend looks and manages your local data"
      />
      <SettingsPanels />
    </div>
  );
}
