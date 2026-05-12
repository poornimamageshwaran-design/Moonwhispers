import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20">
      <Container>
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-neutral-300 leading-relaxed max-w-3xl">
          This is a starter privacy page. Connect it to your production policies once you go live. For now, note that
          we use Supabase to store newsletter subscriptions, contact form messages, and comments.
        </p>
      </Container>
    </div>
  );
}

