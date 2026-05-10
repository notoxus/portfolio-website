import Link from 'next/link'

export const metadata = {
  title: 'My Projects',
  description: 'My project check list.',
}

const PROJECTS = [
  {
    title: 'Video Downloader - Desktop App',
    tech: 'Java (Maven), XML, bash and shell script\nAPIs: Gson, HTTP',
    description: 'A desktop app can get video/playlist URLs from most websites. Using mini Burp Suite to avoid system monitoring',
    link: 'https://github.com/CSerVN/video-downloader',
  },
  {
    title: 'Gym Tracking - Android App',
    tech: 'Java (Gradle with Groovy), APIs: ',
    description: 'Tracking Fitness in Android platform, that is more comfortable and more convenient for most people, especially busy people. Applying design pattern effectively!',
    link: 'https://github.com/CSerVN/oop-design-project',
  },
  {
    title: 'Yoshi PDF - Desktop App',
    tech: 'Java (Maven), XML\nAPIs: tesseract',
    description: 'Handling your PDFs',
    link: 'https://github.com/CSerVN/yoshiPDF',
  },
  {
    title: 'Useful Script',
    tech: 'bash/batch and shell script',
    description: 'Automation scripts to streamline your daily workflow!',
    link: 'https://github.com/CSerVN/UsefulScript',
  },
]

export default function ProjectsPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Projects</h1>
      
      <div className="flex flex-col gap-4">
        {PROJECTS.map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col space-y-1 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
      <div className="flex items-center justify-between">
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {project.title}
      </h2>
      <span className="text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        ↗
      </span>
    </div>

    {/* Dòng Tech Stack mới thêm vào đây */}
    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
      {project.tech}
    </p>

    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
      {project.description}
    </p>
  </a>
))}
      </div>
    </section>
  )
}