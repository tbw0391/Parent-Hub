import Image from 'next/image';
import Link from 'next/link';

export function Logo({ height = 40, href }: { height?: number; href?: string }) {
  const width = Math.round((height * 1018) / 797);

  const img = (
    <Image
      src="/logo/parent-connect-logo.png"
      alt="Parent Connect"
      width={width}
      height={height}
      priority
      className="h-auto"
      style={{ height, width }}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} aria-label="Go to home">
      {img}
    </Link>
  );
}
