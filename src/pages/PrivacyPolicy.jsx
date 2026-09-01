import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: July 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We collect the information you provide when you register, including your name and email address. We also collect information about your use of the app such as videos watched and progress completed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use your information to provide and improve the GO! app experience, track your learning progress, and communicate important updates with you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We do not sell your personal information. We may share data with service providers who assist in operating the app, under strict confidentiality agreements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. AI Features & Third-Party AI Integrations</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The GO! app includes an AI-powered assistant ("GO! AI Assistant") to help you with questions about your mission journey. When you interact with this feature, your messages and relevant context may be processed by third-party AI service providers. We only share the minimum data necessary to generate a response, and we do not use your data to train AI models. All data shared with AI providers is subject to the same confidentiality standards as our other service providers. We remain responsible for ensuring these integrations comply with applicable data protection requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Account & Data Deletion</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You may delete your account and all associated data at any time directly within the GO! app. To do so:
        </p>
        <ol className="text-sm text-muted-foreground leading-relaxed list-decimal list-inside space-y-1 pl-2">
          <li>Open the GO! app and tap the menu icon (☰) in the top right corner.</li>
          <li>Tap <strong>Delete Account</strong> at the bottom of the menu.</li>
          <li>Confirm the deletion in the dialog that appears.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Upon confirmation, the following data is <strong>permanently and immediately deleted</strong> from our systems:
        </p>
        <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Your account profile (name and email address)</li>
          <li>Your video completion progress</li>
          <li>Your My Estuary field guide entries and journal notes</li>
          <li>Any items in your shopping cart</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This action is irreversible. No data is retained after deletion. If you are unable to access the app, you may also request deletion by emailing us at <a href="mailto:support@lifeintheestuary.com" className="text-primary underline">support@lifeintheestuary.com</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Chat Features</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The GO! app includes a group chat feature for participants in GO! groups. All chat users are authenticated and identity-verified — anonymous chat is not supported or permitted. Chat messages are only visible to members of the same group and app administrators.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For privacy questions or data requests, contact us at: <a href="mailto:support@lifeintheestuary.com" className="text-primary underline">support@lifeintheestuary.com</a>
        </p>
      </section>
    </div>
    </div>
  );
}