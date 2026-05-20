import StudyHub from '@/components/StudyHub';

export const metadata = {
  title: 'Study Hub',
  description: 'Video learning supporter!',
};

export default function StudyHubPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Study Hub</h1>
      <StudyHub videoId="dQw4w9WgXcQ" /> 
    </section>
  );
}