import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-950 via-zinc-950 to-zinc-950 p-6 text-center">
      <div className="mb-10 flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="Scoop by Loki"
          width={120}
          height={120}
          className="rounded-2xl shadow-2xl shadow-purple-950"
          priority
        />
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Scoop by Loki</h1>
          <p className="text-purple-300 mt-1 text-base">กินก่อนแบกทีหลัง 🎮</p>
        </div>
      </div>

      <Link
        href="/order"
        className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-purple-900/60 transition-all"
      >
        🍦 สั่งไอศกรีม
      </Link>

      <p className="mt-10 text-zinc-600 text-sm">Delivery เฉพาะในเขตบริการ</p>
    </main>
  );
}
