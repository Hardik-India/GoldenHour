import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export function JoinCTA() {
  return (
    <section className="container-x py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 bg-gradient-to-br from-gold/15 via-night-700 to-alert/15 p-10 text-center sm:p-16">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-alert/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold sm:text-5xl">
            Be the <span className="text-gold-gradient">someone nearby</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/65">
            A few minutes of training and a phone in your pocket can be the difference between a tragedy and a story told at dinner.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/register?role=responder" className="px-8 py-4">Become a Responder</Button>
            <Button href="/register?role=donor" variant="glass" className="px-8 py-4">Register as a Donor</Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
