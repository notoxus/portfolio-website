import StudyHub from '@/components/StudyHub';

export const metadata = {
  title: 'Study Hub',
  description: 'Video learning supporter!',
};

export default function StudyHubPage() {
  return (
    <section className="w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 md:px-8 lg:px-16 pb-20">
      <div className="max-w-[1600px] mx-auto w-full">
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Study Hub</h1>
        <StudyHub /> 
      </div>
    </section>
  );
}