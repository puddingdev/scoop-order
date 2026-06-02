import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-violet-50 p-6 text-center">
      <div className="mb-10 flex flex-col items-center gap-5">
        <Image
          src="/logo.png"
          alt="Scoop by Loki"
          width={110}
          height={110}
          className="rounded-2xl shadow-lg shadow-violet-200"
          priority
        />
        <div>
          <h1 className="text-3xl font-extrabold text-violet-800 tracking-tight">Scoop by Loki</h1>
          <p className="text-violet-500 mt-1 text-base font-medium">กินก่อนแบกทีหลัง 🎮</p>
        </div>
      </div>

      <Link
        href="/order"
        className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-md shadow-violet-300 transition-all"
      >
        🍦 สั่งไอศกรีม
      </Link>

      <p className="mt-10 text-[#7C6F9F] text-sm">Delivery เฉพาะในเขตบริการ</p>
    </main>
  );
}
