import StudyHub from '@/components/StudyHub';
import Link from 'next/link';

export const metadata = {
  title: 'Study Hub',
  description: 'Video learning supporter!',
};

export default function StudyHubPage() {
  return (
    <section className="w-[100dvw] relative left-1/2 right-1/2 -ml-[50dvw] -mr-[50dvw] overflow-x-hidden px-4 md:px-8 lg:px-16 pb-20">
      <div className="max-w-[1600px] mx-auto w-full">
        <Link
          href="/essential-tools"
          className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
        >
          &#8592; Essential Tools
        </Link>
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Study Hub</h1>
        <StudyHub />
      </div>
    </section>
  );
}
