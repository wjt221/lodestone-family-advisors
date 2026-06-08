import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { CLIENT } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Account and portal preferences" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Client Name</p>
              <p className="font-medium text-slate-900">{CLIENT.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Lead Advisor</p>
              <p className="font-medium text-slate-900">{CLIENT.advisor}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Advisor Title</p>
              <p className="font-medium text-slate-900">{CLIENT.advisorTitle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Inception Date</p>
              <p className="font-medium text-slate-900">{CLIENT.inceptionDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {CLIENT.entities.map((e) => (
                <li key={e} className="text-sm text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Compliance Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              LFA Investment OS is an advisor-led investment strategy and portfolio oversight portal. It is not a robo-advisor and does not provide automated investment recommendations.
            </p>
            <p>
              All content within this portal is for discussion purposes only and requires review and approval by your assigned advisor before any action is taken.
            </p>
            <p className="text-xs text-slate-400">
              Lodestone Family Advisors · Investment OS v1.0 · Demo / Illustrative Data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
