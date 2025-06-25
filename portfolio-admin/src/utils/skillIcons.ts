import { IconType } from 'react-icons';
import { 
  SiJavascript, SiTypescript, SiPython, SiPhp, SiHtml5, SiCss3,
  SiReact, SiVuedotjs, SiAngular, SiNodedotjs, SiGit,
  SiFigma, SiAdobephotoshop, SiVisualstudiocode, SiMysql,
  SiAdobeaftereffects, SiAdobepremierepro, SiAdobeillustrator,
  SiFlutter, SiComposer, SiGithub, SiGitlab, SiWordpress,
  SiTailwindcss, SiBootstrap, SiSass, SiPostgresql, SiMongodb,
  SiFirebase, SiLinux, SiUbuntu, SiDebian, SiKalilinux,
  SiPostman, SiNpm, SiYarn, SiDocker, SiKubernetes,
  SiAmazonaws, SiGooglecloud, SiMicrosoftazure, SiNextdotjs,
  SiMariadb, SiMicrosoftexcel, SiMicrosoftpowerpoint, 
  SiMicrosoftword, SiWindows,
  SiOpenapiinitiative
} from 'react-icons/si';
import { FiCode } from 'react-icons/fi';

const skillIconMap: Record<string, IconType> = {
  'adobe after effects': SiAdobeaftereffects,
  'adobe photoshop': SiAdobephotoshop,
  'adobe premiere pro': SiAdobepremierepro,
  'adobe illustrator': SiAdobeillustrator,

  'microsoft excel': SiMicrosoftexcel,
  'microsoft powerpoint': SiMicrosoftpowerpoint,
  'microsoft word': SiMicrosoftword,
  'windows': SiWindows,

  'javascript': SiJavascript,
  'typescript': SiTypescript,
  'python': SiPython,
  'php': SiPhp,
  'html': SiHtml5,
  'css': SiCss3,
  'sass': SiSass,
  'react': SiReact,
  'react native': SiReact,
  'reactnative': SiReact,
  'React native': SiReact,
  'vue.js': SiVuedotjs,
  'vue': SiVuedotjs,
  'Vue.js': SiVuedotjs,
  'angular': SiAngular,
  'node.js': SiNodedotjs,
  'Node.js': SiNodedotjs,
  'next.js': SiNextdotjs,
  'Next.js': SiNextdotjs,
  'flutter': SiFlutter,
  'tailwind': SiTailwindcss,
  'tailwind css': SiTailwindcss,
  'Tailwind CSS': SiTailwindcss,
  'bootstrap': SiBootstrap,
  'wordpress': SiWordpress,

  'api': SiOpenapiinitiative,
  'Api': SiOpenapiinitiative,
  'API': SiOpenapiinitiative,
  'git': SiGit,
  'github': SiGithub,
  'gitlab': SiGitlab,
  'vscode': SiVisualstudiocode,
  'composer': SiComposer,
  'postman': SiPostman,
  'npm': SiNpm,
  'NPM': SiNpm,
  'yarn': SiYarn,
  'pip': SiPython,
  'pip3': SiPython,
  'PIP': SiPython,
  'python pip': SiPython,

  'mysql': SiMysql,
  'mariadb': SiMariadb,
  'postgresql': SiPostgresql,
  'mongodb': SiMongodb,
  'firebase': SiFirebase,

  'docker': SiDocker,
  'kubernetes': SiKubernetes,
  'aws': SiAmazonaws,
  'google cloud': SiGooglecloud,
  'azure': SiMicrosoftazure,

  'linux': SiLinux,
  'ubuntu': SiUbuntu,
  'debian': SiDebian,
  'kali linux': SiKalilinux,

  'figma': SiFigma,
};

export const getSkillIcon = (skillName: string): IconType => {
  const normalizedName = skillName.toLowerCase().trim();
  return skillIconMap[normalizedName] || FiCode;
}; 