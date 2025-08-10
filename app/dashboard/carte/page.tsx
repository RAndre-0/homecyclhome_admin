import dynamic from 'next/dynamic';

const CarteClient = dynamic(() => import('./CarteClient'), { ssr: false });

export default function Page() {
  return <CarteClient />;
}
