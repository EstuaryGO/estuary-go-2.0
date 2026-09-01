import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: June 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By using the GO! app, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Use of the App</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The GO! app is a discipleship resource provided by Life in the Estuary Church. You may use it for personal, non-commercial purposes in accordance with these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to keep it up to date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Content</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All video content, resources, and materials in the app are the property of Life in the Estuary Church and may not be reproduced or distributed without permission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Termination</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate accounts that violate these terms or are used in a manner inconsistent with the purpose of the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For questions about these terms, contact us at: <a href="mailto:support@lifeintheestuary.com" className="text-primary underline">support@lifeintheestuary.com</a>
        </p>
      </section>
    </div>
    </div>
  );
}